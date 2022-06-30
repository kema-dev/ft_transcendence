<template>
	<div id="stage-parent" class="stack">
		<div id="container"></div>
	</div>
</template>
<script setup lang="ts">
import { inject, onMounted, defineProps } from "vue";
import Konva from "konva";
import Field from "@/game2.0/Field";
import Racket from "@/game2.0/Racket";
import Ball from "@/game2.0/Ball";

let define = inject("colors");
let props = defineProps(["nbrPlayer"]);
onMounted(() => {
	var sceneWidth = 1000;
	var sceneHeight = 1000;
	var stage = new Konva.Stage({
		container: "container",
		width: sceneWidth,
		height: sceneHeight,
	});
	let field = new Field(props.nbrPlayer);
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
	});
	stage.add(layer);
	layer.add(background);
	walls.forEach((wall) => {
		layer.add(wall.getKonva());
		if (wall.side) {
			layer.add(wall.getKonvaRacket());
		}
	});
	let ball = new Ball(300, 300).getKonva();
	layer.add(ball);

	var container = stage.container();
	container.tabIndex = 1;
	container.focus();
	var text = new Konva.Text({
		x: 5,
		y: 5,
		fontFamily: "Calibri",
		fontSize: 24,
		text: "",
		fill: "black",
	});
	function writeMessage(message: string) {
		text.text(message);
	}
	stage.on("pointermove", function () {
		var pointerPos = stage.getPointerPosition();
		var x = pointerPos!.x;
		var y = pointerPos!.y;
		writeMessage("x: " + x + ", y: " + y);
	});
	layer.add(text);
	var mov = 0;
	// var ballX = Math.random() * 5;
	// var ballY = 5 - ballX;
	var ballX = 5;
	var ballY = 0;
	if (Math.floor(Math.random() * 2) == 1) ballX = -ballX;
	if (Math.floor(Math.random() * 2) == 1) ballY = -ballY;
	let first = true;
	let rack = walls.get(0)!.getKonvaRacket();

	console.log(rack.y());
	const delay = (time: number) =>
		new Promise((resolve) => setTimeout(resolve, time));
	async function loop() {
		for (let i = 0; i < Infinity; i++) {
			rack.y(rack.y() + mov);
			layer.children?.forEach(function (elem) {
				if (elem == ball) return;
				if (
					detectCollision(
						new Rectangle(elem.x(), elem.y(), elem.height()),
						new Circle(ball.x(), ball.y()),
						elem.rotation()
					)
				) {
					const wall = walls.get(elem.rotation());
					const v = wall!.vector;
					v.normalize();
					// console.log(wall!.angle + " = x: " + v.x + " y: " + v.y);
					// ballX = ballY + v.x;
					// ballY = ballX + v.y;
					const tmpBX = ballX;
					// ballX = ballY * v.y + ballX * v.x;
					// ballY = tmpBX * v.x + ballY * v.y;
					ballX = Math.cos(2*elem.rotation()) * ballX + Math.sin(2*elem.rotation()) * ballY;
					ballY = Math.sin(2*elem.rotation()) * tmpBX - Math.cos(2*elem.rotation()) * ballY;
					// console.log(ballX + " " + ballY);
					// console.log(
					// 	elem.rotation() + " = x: " + elem.x() + " y: " + elem.y()
					// );
					// if (elem == raq) ballX = +5;
					// else if (elem == raq2) ballX = -5;
				}
			});
			first = false;
			ball.x(ball.x() + ballX);
			ball.y(ball.y() + ballY);
			await delay(1); // TODO delta
		}
	}
	loop();
	container.addEventListener("keydown", function (e) {
		if (e.key == "ArrowUp") {
			mov = -5;
		} else if (e.key == "ArrowDown") {
			mov = 5;
			// if (e.key == "ArrowUp") {
			// 	ball.y(ball.y() - 5);
			// } else if (e.key == "ArrowDown") {
			// 	ball.y(ball.y() + 5);
			// } else if (e.key == "ArrowLeft") {
			// 	ball.x(ball.x() - 5);
			// } else if (e.key == "ArrowRight") {
			// 	ball.x(ball.x() + 5);
		} else {
			return;
		}
		e.preventDefault();
	});
	container.addEventListener("keyup", function (e) {
		if (e.key == "ArrowUp") {
			if (mov == -5) mov = 0;
		} else if (e.key == "ArrowDown") {
			if (mov == 5) mov = 0;
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
class Rectangle {
	x: number;
	y: number;
	w: number;
	h: number;
	constructor(x: number, y: number, h: number) {
		this.x = x;
		this.y = y;
		this.w = 7;
		this.h = h;
	}
}

class Circle {
	x: number;
	y: number;
	r: number;
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.r = 10;
	}
}
function detectCollision(rect: Rectangle, circle: Circle, deg: number) {
	var cx, cy;
	var angleOfRad = degToRad(-deg);
	// var rectCenterX = rect.x + rect.w / 2;
	// var rectCenterY = rect.y + rect.h / 2;
	var rectCenterX = rect.x;
	var rectCenterY = rect.y;

	var rotateCircleX =
		Math.cos(angleOfRad) * (circle.x - rectCenterX) -
		Math.sin(angleOfRad) * (circle.y - rectCenterY) +
		rectCenterX;
	var rotateCircleY =
		Math.sin(angleOfRad) * (circle.x - rectCenterX) +
		Math.cos(angleOfRad) * (circle.y - rectCenterY) +
		rectCenterY;

	if (rotateCircleX < rect.x) {
		cx = rect.x;
	} else if (rotateCircleX > rect.x + rect.w) {
		cx = rect.x + rect.w;
	} else {
		cx = rotateCircleX;
	}

	if (rotateCircleY < rect.y) {
		cy = rect.y;
	} else if (rotateCircleY > rect.y + rect.h) {
		cy = rect.y + rect.h;
	} else {
		cy = rotateCircleY;
	}
	// console.log("rotateCircleX", rotateCircleX);
	// console.log("rotateCircleY", rotateCircleY);
	// console.log("cx", cx);
	// console.log("cy", cy);
	// console.log(distance(rotateCircleX, rotateCircleY, cx, cy));
	if (distance(rotateCircleX, rotateCircleY, cx, cy) < circle.r) {
		return true;
	}
	return false;
}
function distance(x1: number, y1: number, x2: number, y2: number) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
function degToRad(deg: number) {
	return (deg * Math.PI) / 180;
}
</script>

<style scoped>
#stage-parent {
	width: 100%;
}
</style>
