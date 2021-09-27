<template>
  <Renderer ref="renderer" antialias pointer resize="window">
    <Camera :position="{ z: 5 }" />
    <Scene background="#000000">
      <PointLight
        :color="light1Color"
        :position="{ x: -2, y: -2, z: 2 }"
        :intensity="0.5"
      />
      <PointLight
        :color="light2Color"
        :position="{ x: -2, y: 2, z: 2 }"
        :intensity="1.0"
      />
      <PointLight
        :color="light3Color"
        :position="{ x: 2, y: 2, z: 2 }"
        :intensity="1.0"
      />
      <PointLight
        :color="light4Color"
        :position="{ x: 2, y: -2, z: 2 }"
        :intensity="0.5"
      />
      <Tube v-for="t in tubes" :ref="t.key" v-bind="t" :key="t.key">
        <StandardMaterial
          color="#606060"
          :receiveShadow="true"
          :props="{ roughness: 0.4, metalness: 1 }"
        />
      </Tube>
      <Box :position="{ x: 0, y: 0, z: 1 }" :size="1" ref="cube">
        <StandardMaterial
          color="#ffffff"
          :castShadow="true"
          :props="{ roughness: 0.6, metalness: 0.8 }"
        />
      </Box>
    </Scene>
  </Renderer>
</template>

<script>
import { Vector3 } from "three";
import SimplexNoise from "simplex-noise";
import {
  AmbientLight,
  Camera,
  PointLight,
  Renderer,
  Scene,
  StandardMaterial,
  Tube,
  Box,
} from "troisjs";
const NX = 80;
const NY = 15;
const RADIUS = 0.1;
const simplex = new SimplexNoise();
export default {
  components: {
    AmbientLight,
    Camera,
    PointLight,
    Renderer,
    Scene,
    StandardMaterial,
    Tube,
    Box,
  },
  data() {
    return {
      tubes: [],
      light1Color: "#b307b5",
      light2Color: "#8132aa",
      light3Color: "#5737d0",
      light4Color: "#0d25bb",
      lightWColor: "#eeeeee",
    };
  },
  props: {
    roll: { default: 0, type: Number },
    pitch: { default: 0, type: Number },
    yaw: { default: 0, type: Number },
  },
  mounted() {
    this.renderer = this.$refs.renderer;
    this.size = this.renderer.three.size;
    this.initTubes();
    const cubeMesh = this.$refs.cube.mesh;
    cubeMesh.rotation.order = "YXZ";  // aviation YPR standard

    const xAxis = new Vector3(1, 0, 0);

    this.renderer.onBeforeRender(() => {
      const time = Date.now() * 0.0002;
      let points, x, y, x1, y1, noisey, noisez;
      // animate tubes
      for (let j = 0; j < NY; j++) {
        points = this._points[j];
        for (let i = 0; i < NX; i++) {
          x = this.x0 + i * this.dx;
          x1 = x * 0.25;
          y = this.y0 + j * this.dy;
          y1 = y * 0.25;
          noisey = simplex.noise2D(x1 - time, y1 - time) * 0.3;
          noisez = simplex.noise2D(y1 + time, x1 + time) * 0.3;
          points[i].x = x;
          points[i].y = y + noisey;
          points[i].z = noisez;
        }
        this.$refs[this.tubes[j].key].updatePoints(points);
      }

      // animate cube
      cubeMesh.rotation.x = this.$props.pitch;
      cubeMesh.rotation.y = -this.$props.yaw;
      cubeMesh.rotation.z = -this.$props.roll;
      cubeMesh.rotateOnWorldAxis(xAxis, 0.4);  // to "orbit camera" relative to cube
    });
    this.renderer.onResize(() => {
      this.initTubes();
    });
  },
  methods: {
    initTubes() {
      this._points = []; // point copy (not reactive)
      this.tubes.splice(0);
      this.dx = this.size.wWidth / (NX - 1);
      this.dy = this.size.wHeight / (NY - 1);
      this.x0 = -this.size.wWidth / 2;
      this.y0 = -this.size.wHeight / 2;
      for (let j = 0; j < NY; j++) {
        const points = [];
        this._points[j] = [];
        for (let i = 0; i < NX; i++) {
          const v = new Vector3(
            this.x0 + i * this.dx,
            this.y0 + j * this.dy,
            0
          );
          points.push(v);
          this._points[j].push(v.clone());
        }
        this.tubes.push({
          key: `tube-${j}`,
          points,
          radius: RADIUS,
          tubularSegments: NX,
          radialSegments: 8,
        });
      }
    },
  },
};
</script>
