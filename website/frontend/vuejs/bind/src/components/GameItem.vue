<!-- <template>
  <div>
    <v-stage ref="stage" :config="kanva.stageSize">
      <v-layer>
      <v-rect :config="{
          x: 500,
          y: 500,
          width: 400,
          height: 200,
          fill: 'white',
          shadowBlur: 10,
        }"
      />
      </v-layer>
      <v-layer ref="dragLayer"></v-layer>
    </v-stage>
  </div>
</template>

<script setup lang="ts">

let kanva = {stageSize: {
        width: 1000,
        height: 1000
      }}
function handle
</script> -->
<template>
	<div>
		<div id="container"></div>
	</div>
</template>

<script setup lang="ts">
import { inject, onMounted } from "vue";
import Konva from "konva";

let define = inject("colors");
onMounted(() => {
	var stage = new Konva.Stage({
		container: "container",
		width: window.innerWidth,
		height: window.innerHeight,
	});

	var layer = new Konva.Layer();
	stage.add(layer);

	var circle = new Konva.Circle({
		x: stage.width() / 2,
		y: stage.height() / 2 + 10,
		radius: 70,
		fill: "red",
		stroke: "black",
		strokeWidth: 4,
	});
var rectangle = new Konva.Rect({
          x: 20,
        y: 20,
        width: 100,
        height: 50,
        fill: 'green',
        stroke: 'black',
        strokeWidth: 4,
})

	layer.add(circle);
	layer.add(rectangle);

	var container = stage.container();

	// make it focusable

	container.tabIndex = 1;
	// focus it
	// also stage will be in focus on its click
	container.focus();

	const DELTA = 8;

	container.addEventListener("keydown", function (e) {
		if (e.keyCode === 37) {
			circle.x(circle.x() - DELTA);
		} else if (e.keyCode === 38) {
			circle.y(circle.y() - DELTA);
		} else if (e.keyCode === 39) {
			circle.x(circle.x() + DELTA);
		} else if (e.keyCode === 40) {
			circle.y(circle.y() + DELTA);
		} else {
			return;
		}
		e.preventDefault();
	});
});
</script>

<style scoped></style>
