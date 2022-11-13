<template>
	<div id="stage-parent" class="stack">
		<div id="container" v-on:click="focus()"></div>
	</div>
</template>
<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref, Ref } from 'vue';
import Konva from 'konva';
import { Socket } from 'socket.io-client';
import { GameDto } from '@/dto/GameDto';
import Profile from '@/game2.0/Profile';
import ProfileUserDto from '@/dto/ProfileUserDto';
import { SmallGameDto } from '@/dto/SmallGameDto';
import { BallDto } from '@/dto/BallDto';
import ProfileDto from '@/dto/ProfileDto';
import { RacketDto } from '@/dto/RacketDto';

let socket: Socket = inject('socket')!;
let run = true;
// let nbrPlayer = ref(props.nbrPlayer)
let me: Ref<ProfileUserDto> = inject('user')!;
let rotation = 0;
let gameDto: GameDto | undefined = undefined;
var mov = 0;
let rackets: Konva.Rect[] = [];
let walls: Konva.Rect[] = [];
let balls: Konva.Circle[] = [];
let profiles: Profile[] = [];
var container: any;

function focus() {
	container.focus();
}
socket.on('init_game', (game: string) => {
	gameDto = JSON.parse(game);
});
onMounted(async () => {
	socket.emit('get_game');
	socket.on('update_game', (game: string) => {
		let newGame: SmallGameDto = JSON.parse(game);
		if (!gameDto || gameDto == undefined || !game)
			return;
		gameDto.start = newGame.start;
		if (gameDto.balls.length != newGame.balls.length)
			console.log('balls: ', gameDto.balls.length, newGame.balls.length);
		for (let i = 0; i < newGame.balls.length; i++) {
			if (!gameDto.balls[i])
				gameDto.balls.push(newGame.balls[i]);
			else {
				gameDto.balls[i].x = newGame.balls[i].x;
				gameDto.balls[i].y = newGame.balls[i].y;
			}
		}
		while (gameDto.balls.length > newGame.balls.length)
			gameDto.balls.pop();
		if (gameDto.rackets.length != newGame.rackets.length)
			console.log('rackets: ', gameDto.rackets.length, newGame.rackets.length);
		for (let i = 0; i < newGame.rackets.length; i++) {
			if (!gameDto.rackets[i])
				gameDto.rackets.push(newGame.rackets[i]);
			else {
				gameDto.rackets[i].x = newGame.rackets[i].x;
				gameDto.rackets[i].y = newGame.rackets[i].y;
			}
		}
		while (gameDto.rackets.length > newGame.rackets.length)
			gameDto.rackets.pop();
		if (gameDto.profiles.length != newGame.profiles.length)
			console.log('profiles: ', gameDto.profiles.length, newGame.profiles.length);
		for (let i = 0; i < newGame.profiles.length; i++) {
			gameDto.profiles[i].score = newGame.profiles[i].score;
			gameDto.profiles[i].red = newGame.profiles[i].red;
		}
		while (gameDto.profiles.length > newGame.profiles.length)
			gameDto.profiles.pop();
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
		if (!container) return;
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

	while (gameDto === undefined || !gameDto.walls) {
		await delay(100);
	}
	console.log(gameDto);
	for (let player of gameDto.profiles) {
		if (me?.value?.login == player.login) break;
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
		socket.emit('setMov', {
			mov: mov,
			login: me?.value?.login,
			lobby_name: me?.value?.lobby_name,
		});
		e.preventDefault();
	});
	container.addEventListener('keyup', function (e: any) {
		if (e.key == 'ArrowLeft') {
			if (mov <= 0) mov = 0;
		} else if (e.key == 'ArrowRight') {
			if (mov >= 0) mov = 0;
		} else {
			return;
		}
		socket.emit('setMov', {
			mov: mov,
			login: me?.value?.login,
			lobby_name: me?.value?.lobby_name,
		});
		e.preventDefault();
	});
});
async function loop() {
	while (gameDto === undefined) {
		await delay(100);
	}
	while (run) {
		if (gameDto.start)
			for (let i = 0; i < balls.length; ++i) {
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
		await delay(1);
	}
}
onUnmounted(() => {
	run = false;
	socket.off('update_game');
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
