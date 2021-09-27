const { app, ipcMain, BrowserWindow } = require("electron");
const path = require("path");
const THREE = require("three");

const rclnodejs = require("rclnodejs");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 1024,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("dist/index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// ROS2 stuff
let publisher;
const ROT_OFFSET_Z = -38.5 * 1e-3; // -38.5mm

rclnodejs.init().then(() => {
  const node = new rclnodejs.Node("stewart_ui_node");
  publisher = node.createPublisher("geometry_msgs/msg/Pose", "target_pose");
  node.spin();
});

ipcMain.on("send-pose", (event, arg) => {
  // convert orientation
  const ori = new THREE.Euler(arg.roll, arg.pitch, arg.yaw, "YXZ");
  const quat = new THREE.Quaternion();
  quat.setFromEuler(ori);

  // rotate with offset
  const pos = new THREE.Vector3(0, 0, -ROT_OFFSET_Z);
  pos.applyQuaternion(quat);

  publisher.publish({
    position: { x: pos.x, y: pos.y, z: pos.z },
    orientation: { x: quat.x, y: quat.y, z: quat.z, w: quat.w },
  });
});
