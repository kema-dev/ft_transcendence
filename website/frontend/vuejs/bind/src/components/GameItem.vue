<template>
	<div id="stage-parent" class="stack">
		<div id="container"></div>
	</div>
</template>
<script setup lang="ts">
import { inject, onMounted, defineProps, onUnmounted } from "vue";
import Konva from "konva";
import Field from "@/game2.0/Field";
import Ball from "@/game2.0/Ball";

let define = inject("colors");
let props = defineProps(["nbrPlayer", "nbrBall"]);
let run = true;

onMounted(() => {
	var sceneWidth = 1000;
	var sceneHeight = 1000;
	var stage = new Konva.Stage({
		container: "container",
		width: sceneWidth,
		height: sceneHeight,
	});
	let field = new Field(props.nbrPlayer);
	let balls: Array<Ball> = [];
	for (let i = 0; i < props.nbrBall; ++i) {
		balls.push(new Ball(sceneWidth / 2, sceneHeight / 2));
	}
	var group = new Konva.Group({
		x: 500,
		y: 500,
		rotation: -90,
		offsetX: 500,
		offsetY: 500,
	});
	var g = new Konva.Group();
	const layer = new Konva.Layer();
	let walls = field.getWalls();
	let fieldPoints: Array<number> = [];
	walls.forEach((wall) => {
		fieldPoints.push(wall.x);
		fieldPoints.push(wall.y);
	});
	let background = new Konva.Line({
		points: fieldPoints,
		closed: true,
		fill: "#E5F4FB",
		shadowColor: "black",
		shadowBlur: 5,
		shadowOffset: { x: 5, y: 5 },
		shadowOpacity: 0.3,
	});
	stage.add(layer);
	group.add(background);
	let rack: Konva.Rect;
	walls.forEach((wall) => {
		g.add(wall.getKonva());
		if (wall.side) {
			let tmp = wall.getKonvaRacket();
			g.add(tmp);
			if (wall.angle == 0) rack = tmp;
		}
	});
	// let ball.konva = ball.getKonva()
	for (let i = 0; i < props.nbrBall; ++i) group.add(balls[i].konva);
	group.add(g);
	layer.add(group);
	var container = stage.container();
	container.tabIndex = 1;
	container.focus();
	// var text = new Konva.Text({
	// 	x: 5,
	// 	y: 5,
	// 	fontFamily: "Calibri",
	// 	fontSize: 24,
	// 	text: "",
	// 	fill: "black",
	// });
	// function writeMessage(message: string) {
	// 	text.text(message);
	// }
	// stage.on("pointermove", function () {
	// 	var pointerPos = stage.getPointerPosition();
	// 	var x = pointerPos!.x;
	// 	var y = pointerPos!.y;
	// 	writeMessage("x: " + x + ", y: " + y);
	// });
	// layer.add(text);
	var mov = 0;
	// var ballX = Math.random() * 5;
	// var ballY = 5 - ballX;
	let deltaTime = 1;
	async function loop() {
		// let start = 1000000 * performance.now();
		while (run) {
			for (let i = 0; i < props.nbrBall; ++i) {
				balls[i].detectCollision(g, walls);
				balls[i].konva.x(
					balls[i].konva.x() + balls[i].v.x * balls[i].speed * deltaTime
				);
				balls[i].konva.y(
					balls[i].konva.y() + balls[i].v.y * balls[i].speed * deltaTime
				);
			}
			if (
				rack.y() + mov > walls.get(0)!.y &&
				rack.y() + mov < walls.get(0)!.y + (walls.get(0)!.width / 4) * 3
			)
				rack.y(rack.y() + mov);
			// let end = 1000000 * performance.now();
			// deltaTime = (end - start) * 0.000001;
			// console.log("start: " + start);
			// console.log("end: " + end);
			// console.log("deltatime: " + deltaTime);
			// start = end;
			//deltaTime = deltaTime * 0.000001
			await delay(1); // TODO delta
		}
	}

	loop();
	let delta = (walls.get(0)!.width / 100) * deltaTime;
	// let delta = 5
	container.addEventListener("keydown", function (e) {
		if (e.key == "ArrowLeft") {
			mov = -delta;
		} else if (e.key == "ArrowRight") {
			mov = delta;
			// if (e.key == "ArrowUp") {
			// 	ball.y(ball.y() - delta);
			// } else if (e.key == "ArrowDown") {
			// 	ball.y(ball.y() + delta);
			// } else if (e.key == "ArrowLeft") {
			// 	ball.x(ball.x() - delta);
			// } else if (e.key == "ArrowRight") {
			// 	ball.x(ball.x() + delta);
		} else {
			return;
		}
		e.preventDefault();
	});
	container.addEventListener("keyup", function (e) {
		if (e.key == "ArrowLeft") {
			if (mov == -delta) mov = 0;
		} else if (e.key == "ArrowRight") {
			if (mov == delta) mov = 0;
		} else {
			return;
		}
		e.preventDefault();
	});
	function fitStageIntoParentContainer() {
		var container = document.getElementById("stage-parent");

		// now we need to fit stage into parent container
		var containerWidth = container!.offsetWidth;

		// but we also make the full scene visible
		// so we need to scale all objects on canvas
		var scale = containerWidth / sceneWidth;

		stage.width(sceneWidth * scale);
		stage.height(sceneHeight * scale);
		stage.scale({ x: scale, y: scale });
	}
	fitStageIntoParentContainer();
	window.addEventListener("resize", fitStageIntoParentContainer);
});
onUnmounted(() => {
	run = false;
	// window.removeEventListener("resize", () => {});
});
const delay = (time: number) =>
	new Promise((resolve) => setTimeout(resolve, time));
</script>

<style scoped>
#stage-parent {
	width: 100%;
}
</style>
