<template>
  <div v-if="selectedGamepad != null">
    <h2>Selected Gamepad: {{ selectedGamepad.id }}</h2>
    <button v-on:click="selectedGamepad = null">Change Gamepad</button>
  </div>

  <div v-if="selectedGamepad == null">
    <h2>Available gamepads:</h2>
    <div class="gamepad" v-for="gamepad in gamepads" :key="gamepad.id">
      <h3>{{ gamepad.index }}: {{ gamepad.id }}</h3>
      <div v-if="selectedGamepad == null"></div>
      <button v-on:click="selectedGamepad = gamepad">
        Select This Gamepad
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "gamepad",
  components: {},
  data() {
    return {
      gamepads: [],
      selectedGamepad: {},
    };
  },
  emits: ["gamepadInput"],
  mounted() {
    window.addEventListener("gamepadconnected", this.gamepadConnectionHandler);
    window.addEventListener(
      "gamepaddisconnected",
      this.gamepadDisconnectionHandler
    );
    setInterval(this.cycle, 10);
  },
  methods: {
    gamepadConnectionHandler(event) {
      this.gamepads.push(event.gamepad);
      console.log("Gamepad Connected: " + event.gamepad.id);
    },
    gamepadDisconnectionHandler(event) {
      this.gamepads.splice(this.gamepads.indexOf(event.gamepad), 1);
      console.log("Gamepad Disconnected: " + event.gamepad.id);
    },
    cycle() {
      this.gamepads = this.scanGamepads();
      if (this.selectedGamepad != null) {
        const gamepadData = this.gamepads[this.selectedGamepad.index];
        this.selectedGamepad = gamepadData;
        if (gamepadData) {
          this.$emit("gamepadInput", {
            axes: this.selectedGamepad.axes,
            buttons: this.selectedGamepad.buttons,
          });
        }
      }
    },
    scanGamepads() {
      return navigator.getGamepads
        ? Array.from(navigator.getGamepads()).filter((gp) => gp !== null)
        : navigator.webkitGetGamepads
        ? Array.from(navigator.webkitGetGamepads()).filter((gp) => gp !== null)
        : [];
    },
  },
};
</script>

<style scoped>
</style>
