<template>
	<div id="stage-parent" class="stack" :key="nbrPlayer">
		<div id="container" v-on:click="focus()"></div>
	</div>
</template>
<script setup lang="ts">
import { inject, onMounted, defineProps, onUnmounted, ref } from 'vue';
import Konva from 'konva';
import { Socket } from 'socket.io-client';
import { GameDto } from '@/dto/GameDto';
import Profile from '@/game2.0/Profile';
import User from '@/chat/User';

let socket: Socket = inject('socket')!;
let run = true;
// let nbrPlayer = ref(props.nbrPlayer)
let me: User = inject("me")!;
let rotation = 0;
let gameDto: GameDto | undefined = undefined;

let props = defineProps<{
	nbrPlayer: number;
	nbrBall: number;
	players: Array<string>;
	lobby_name: string;
	start: boolean;
	owner: string;
}>();

// let balls: Array<Ball> = [];
var mov = 0;
let rackets: Konva.Rect[] = [];
let walls: Konva.Rect[] = [];
let balls: Konva.Circle[] = [];
let profiles: Profile[] = [];
var container: any;

onMounted(async () => {
	update();
});
async function update() {
	socket.emit('newRoom', {
		nbrBall: props.nbrBall,
		nbrPlayer: props.nbrPlayer,
		players: props.players,
		lobby_name: props.lobby_name,
		owner: props.owner,
	});
	socket.on(props.lobby_name, (game: string) => {
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
		container: 'container',
		width: sceneWidth,
		height: sceneHeight,
	});
	var game = new Konva.Group({
		x: 500,
		y: 500,
		offsetX: radius,
		offsetY: radius,
	});
	const layer = new Konva.Layer();
	let fieldPoints: Array<number> = [];
	stage.add(layer);
	container = stage.container();
	container.tabIndex = 1;
	container.focus();
	function fitStageIntoParentContainer() {
		var container = document.getElementById('stage-parent');
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
	window.addEventListener('resize', fitStageIntoParentContainer);

	while (gameDto === undefined) {
		await delay(100);
	}
	for (let player of gameDto.profiles) {
		if (me == player.login) break;
		rotation -= 360 / gameDto.nbrPlayer;
	}
	game.rotation(rotation - 90);
	var objects = new Konva.Group();
	for (let wall of gameDto.walls) {
		fieldPoints.push(wall.x);
		fieldPoints.push(wall.y);
		let tmp = new Konva.Rect({
			width: wall.w,
			height: wall.h,
			fill: '#16638D',
			rotation: wall.rotation,
			x: wall.x,
			y: wall.y,
		});
		objects.add(tmp);
		walls.push(tmp);
	}
	for (let rack of gameDto.rackets) {
		let tmp = new Konva.Rect({
			width: rack.w,
			height: rack.h,
			fill: '#16638D',
			rotation: rack.rotation,
			x: rack.x,
			y: rack.y,
		});
		objects.add(tmp);
		rackets.push(tmp);
	}
	for (let ball of gameDto.balls) {
		let tmp = new Konva.Circle({
			fill: '#16638D',
			x: ball.x,
			y: ball.y,
			radius: 10,
		});
		objects.add(tmp);
		balls.push(tmp);
	}
	for (let profile of gameDto.profiles) {
		let tmp = new Profile(profile, rotation);
		game.add(tmp.konva);
		profiles.push(tmp);
	}
	let background = new Konva.Line({
		points: fieldPoints,
		closed: true,
		fill: '#E5F4FB',
		shadowColor: 'black',
		shadowBlur: 5,
		shadowOffset: { x: 5, y: 5 },
		shadowOpacity: 0.3,
	});
	game.add(background);
	game.add(objects);
	layer.add(game);
	loop();
	container.addEventListener('keydown', function (e: any) {
		if (e.key == 'ArrowLeft') {
			mov = -1;
		} else if (e.key == 'ArrowRight') {
			mov = 1;
		} else {
			return;
		}
		socket.emit("setMov", { mov: mov, login: me });
		e.preventDefault();
	});
	container.addEventListener("keyup", function (e: any) {
		if (e.key == "ArrowLeft") {
			if (mov <= 0) mov = 0;
		} else if (e.key == "ArrowRight") {
			if (mov >= 0) mov = 0;
		} else {
			return;
		}
		socket.emit("setMov", { mov: mov, login: me });
		e.preventDefault();
	});
}
async function loop() {
	while (gameDto === undefined) {
		await delay(100);
	}
	while (run) {
		if (gameDto.start)
			for (let i = 0; i < gameDto.nbrBall; ++i) {
				balls[i].x(gameDto.balls[i].x);
				balls[i].y(gameDto.balls[i].y);
			}
		for (let i in gameDto.rackets) {
			rackets[i].x(gameDto.rackets[i].x);
			rackets[i].y(gameDto.rackets[i].y);
		}
		for (let i in gameDto.profiles) {
			let p = profiles[i];
			p.konvaScore.text(gameDto.profiles[i].score.toString());
			if (gameDto.profiles[i].red) {
				p.konvaScore.fontSize(30);
				p.konvaScore.fill('#E00D0D');
				p.konvaBackground.stroke('#E00D0D');
				p.konvaRound.stroke('#E00D0D');
				p.konvaRound.strokeWidth(5);
				p.konvaBackground.strokeWidth(5);
			} else {
				p.konvaBackground.stroke('#16638D');
				p.konvaBackground.strokeWidth(3);
				p.konvaRound.stroke('#16638D');
				p.konvaRound.strokeWidth(3);
				p.konvaScore.fontSize(25);
				p.konvaScore.fill('#16638D');
			}
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
	socket.off(props.lobby_name);
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
