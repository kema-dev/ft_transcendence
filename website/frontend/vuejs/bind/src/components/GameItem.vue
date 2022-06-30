<template>
	<div>
		<div id="container"></div>
	</div>
</template>
<script setup lang="ts">
import { inject, onMounted } from "vue";
import Konva from "konva";
import Field from "@/game2.0/Field";
import Racket from "@/game2.0/Racket";
import Ball from "@/game2.0/Ball";

let define = inject("colors");
onMounted(() => {
	var stage = new Konva.Stage({
		container: "container",
		width: window.innerWidth,
		height: window.innerHeight,
	});

	var raq = new Konva.Rect({
		x: 15,
		y: 300,
		width: 7,
		height: 100,
		fill: "#16638D",
	});
	var raq2 = new Konva.Rect({
		x: 712,
		y: 300,
		width: 7,
		height: 100,
		fill: "#16638D",
	});
	let myField = new Field(4);
	let layer = myField.getLayer();
	let walls = myField.getWalls();
	stage.add(layer);
	// layer.add(raq);
	// layer.add(raq2);
	let ball = new Ball(300, 300).getKonva();
	layer.add(ball);

	var container = stage.container();

	// make it focusable

	container.tabIndex = 1;
	// focus it
	// also stage will be in focus on its click
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
	var ballX = 2.5;
	var ballY = 2.5;
	if (Math.floor(Math.random() * 2) == 1) ballX = -ballX;
	if (Math.floor(Math.random() * 2) == 1) ballY = -ballY;
	let first = true;
	const delay = (time: number) =>
		new Promise((resolve) => setTimeout(resolve, time));
	async function loop(raq: Konva.Rect) {
		for (let i = 0; i < Infinity; i++) {
			raq.y(raq.y() + mov);
			layer.children?.forEach(function (elem) {
				if (elem == ball) return;
				// if (haveIntersection(elem.getClientRect(), ball.getClientRect())) {
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
					console.log(wall!.angle + " = x: " + v.x + " y: " + v.y);
					// ballX = ballY + v.x;
					// ballY = ballX + v.y;
					const tmpBX = ballX;
					ballX = ballY * v.y + ballX * v.x;
					ballY = tmpBX * v.x + ballY * v.y;
					console.log(ballX + " " + ballY);
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
	loop(raq);
	container.addEventListener("keydown", function (e) {
		// if (e.key == "ArrowUp") {
		// 	mov = -5;
		// } else if (e.key == "ArrowDown") {
		// 	mov = 5;
		if (e.key == "ArrowUp") {
			ball.y(ball.y() - 5);
		} else if (e.key == "ArrowDown") {
			ball.y(ball.y() + 5);
		} else if (e.key == "ArrowLeft") {
			ball.x(ball.x() - 5);
		} else if (e.key == "ArrowRight") {
			ball.x(ball.x() + 5);
		} else if (e.key == "8") {
			raq2.y(raq2.y() - 8);
		} else if (e.key == "2") {
			raq2.y(raq2.y() + 8);
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
		} else if (e.key == "8") {
			raq2.y(raq2.y() - 8);
		} else if (e.key == "2") {
			raq2.y(raq2.y() + 8);
		} else {
			return;
		}
		e.preventDefault();
	});
	container.addEventListener("always", function (e) {
		console.log("test");
	});
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

<style scoped></style>
