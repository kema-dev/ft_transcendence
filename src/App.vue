<template>
  <LeftHalf name="Left Half" />
  <RightHalf name="Right Half" />
</template>

<script>
import LeftHalf from "./components/LeftHalf.vue";
import RightHalf from "./components/RightHalf.vue";

export default {
  name: "App",
  components: {
    LeftHalf,
    RightHalf,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
/* Pattern styles */
.container {
  display: table;
  width: 100%;
}

.left-half {
  background-color: #ff9e2c;
  position: absolute;
  left: 0px;
  width: 65%;
}

.right-half {
  background-color: #b6701e;
  position: absolute;
  right: 0px;
  width: 35%;
}
</style>
