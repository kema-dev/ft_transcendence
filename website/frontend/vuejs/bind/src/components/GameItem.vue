<template>
	<div id="stage-parent" class="stack" :key="nbrPlayer">
		<div id="container" v-on:click="focus()"></div>
	</div>
</template>
<script setup lang="ts">
import { inject, onMounted, defineProps, onUnmounted, ref, h } from "vue";
import Konva from "konva";
import Socket from "@/utils/Socket";
import { GameDto } from "@/dto/GameDto";
let define = inject("colors");
let socket: Socket = inject("socket");
socket.send("newRoom", {
	nbrBall: 1,
	nbrPlayer: 4,
});
let props = defineProps(["nbrPlayer", "nbrBall", "start"]);
let run = true;
// let nbrPlayer = ref(props.nbrPlayer)
let players = ["zeus", "Toto", "Jj"];

let gameDto: GameDto | undefined = undefined;

// let balls: Array<Ball> = [];
var mov = 0;
let deltaTime = 1;
let rackets: Konva.Rect[] = [];
let walls: Konva.Rect[] = [];
let balls: Konva.Circle[] = [];
let profiles: Konva.Group[];
onMounted(async () => {
	socket.on("game", (game: string) => {
		// console.log(game)
		gameDto = JSON.parse(game);
		// console.log(gameDto);
		// if (bool) {
		// 	bool = false;
		// 	loop();
		// }
	});
	var sceneWidth = 1000;
	var sceneHeight = 1000;
	let radius = 410;
	var stage = new Konva.Stage({
		container: "container",
		width: sceneWidth,
		height: sceneHeight,
	});
	var game = new Konva.Group({
		x: 500,
		y: 500,
		rotation: -90,
		offsetX: radius,
		offsetY: radius,
	});
	const layer = new Konva.Layer();
	let fieldPoints: Array<number> = [];
	while (gameDto === undefined) {
		await delay(100);
	}
	stage.add(layer);
	var objects = new Konva.Group();
	for (let wall of gameDto.walls) {
		fieldPoints.push(wall.x);
		fieldPoints.push(wall.y);
		let tmp = new Konva.Rect({
			width: wall.h,
			height: wall.w,
			fill: "#16638D",
			rotation: wall.rotation,
			x: wall.x,
			y: wall.y,
		});
		objects.add(tmp);
		walls.push(tmp);
	}
	for (let rack of gameDto.rackets) {
		let tmp = new Konva.Rect({
			width: rack.h,
			height: rack.w,
			fill: "#16638D",
			rotation: rack.rotation,
			x: rack.x,
			y: rack.y,
		});
		objects.add(tmp);
		rackets.push(tmp);
	}
	for (let ball of gameDto.balls) {
		let tmp = new Konva.Circle({
			fill: "#16638D",
			x: ball.x,
			y: ball.y,
			radius: 10,
		});
		game.add(tmp);
		balls.push(tmp);
	}
	let background = new Konva.Line({
		points: fieldPoints,
		// x: this.x,
		// y: this.y,
		closed: true,
		fill: "#E5F4FB",
		shadowColor: "black",
		shadowBlur: 5,
		shadowOffset: { x: 5, y: 5 },
		shadowOpacity: 0.3,
	});
	game.add(background);
	game.add(objects);
	layer.add(game);
	loop();
	var container = stage.container();
	container.tabIndex = 1;
	container.focus();
	function focus() {
		container.focus();
	}

	container.addEventListener("keydown", function (e) {
		if (e.key == "ArrowLeft") {
			mov = -1;
		} else if (e.key == "ArrowRight") {
			mov = 1;
		} else {
			return;
		}
		socket.send("setMov", mov);
		e.preventDefault();
	});
	container.addEventListener("keyup", function (e) {
		if (e.key == "ArrowLeft") {
			if (mov <= 0) mov = 0;
		} else if (e.key == "ArrowRight") {
			if (mov >= 0) mov = 0;
		} else {
			return;
		}
		socket.send("setMov", mov);
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
async function loop() {
	while (gameDto === undefined) {
		await delay(100);
	}
	while (run) {
		if (gameDto.start) {
			// let b: Ball[] = socket.send('ballsPos', '');
			// console.log(b)
			for (let i = 0; i < gameDto.nbrBall; ++i) {
				balls[i].x(gameDto.balls[i].x);
				balls[i].y(gameDto.balls[i].y);
			}
		}
		for (let i in gameDto.rackets) {
			rackets[i].x(gameDto.rackets[i].x);
			rackets[i].y(gameDto.rackets[i].y);
		}
		// if (
		// 	rack.y() + mov * deltaTime > walls.get(0)!.y &&
		// 	rack.y() + mov * deltaTime <
		// 		walls.get(0)!.y + (walls.get(0)!.width / 4) * 3
		// )
		// 	rack.y(rack.y() + mov * deltaTime);
		await delay(1); // TODO delta
	}
}
onUnmounted(() => {
	run = false;
	socket.off("game");
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
