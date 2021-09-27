<template>
  <div id="container">
    <Gamepad @gamepadInput="handleGamepad" />
  </div>
  <div id="cubet">
    <Cubes
      ref="cube"
      v-bind:roll="roll"
      v-bind:pitch="pitch"
      v-bind:yaw="yaw"
    />
  </div>
</template>

<script>
import Cubes from "./components/Cubes.vue";
import Gamepad from "./components/Gamepad.vue";

export default {
  name: "App",
  components: {
    Cubes,
    Gamepad,
  },
  data() {
    return {
      roll: 0,
      pitch: 0,
      yaw: 0,
    };
  },
  methods: {
    handleGamepad(event) {
      // axis 0: left stick ->right,
      // axis 1: left stick ->down,
      // axis 2: right stick ->right,
      // axis 3: right stick ->down,
      // button 6: left trigger,
      // button 7: right trigger
      this.roll = 0.2 * event.axes[2];
      this.pitch = 0.2 * event.axes[3];
      this.yaw = 0.25 * (-event.buttons[6].value + event.buttons[7].value);

      // push to backend
      window.ipcRenderer.send("send-pose", {
        roll: this.roll,
        pitch: this.pitch,
        yaw: this.yaw,
      });
    },
  },
};
</script>

<style>
#container {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #fafafa;
}

#cubet {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
}

body,
html {
  margin: 0;
  overflow: hidden;
}
</style>
