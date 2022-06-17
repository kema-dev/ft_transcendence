<template>
	<div id="scene-container">
		<div>{{Player1.points}}</div>
		<div>{{Player2.points}}</div>
		<!-- <PlayerBar :scene="scene" :camera="camera" :renderer="renderer" id="pbar1"></PlayerBar>
		<PlayerBar :scene="scene" :camera="camera" :renderer="renderer" id="pbar2"></PlayerBar> -->
	</div>
</template>

<script lang="ts" setup>
// import PlayerBar from './PlayerBar.vue';
import FieldBorders from '../game/FieldBorders' 
import FieldPlane from '../game/FieldPlane' 
import PlayerBar from '../game/PlayerBar' 
import Ball from '../game/Ball' 
import { onMounted, reactive, ref, Ref } from 'vue';
import * as THREE from 'three';
import { CSG } from 'three-csg-ts';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface BallPos {
	x: number;
	y: number;
}

// let loader:  GLTFLoader;

let height = 10;
let width = 15;
let border = 0.05;

let field: FieldBorders;
let plane: FieldPlane;
let bar1: PlayerBar;
let bar2: PlayerBar;
let ball: Ball;
const Player1 = ref({ points: 0 });
const Player2 = ref({ points: 0 });

let barSpeed = 0.02;
let upBar1Bool = 0;
let downBar1Bool = 0;
let upBar2Bool = 0;
let downBar2Bool = 0;
let YBarBorder: number;

let XBallBorder: number;
let YBallBorder: number;
let contactBarLimit: number;

let IDanimation: number;
let microtime1: number;
let microtime2: number;

let scene = new THREE.Scene();
scene.background = new THREE.Color(0xE5F4FB);
let camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2);
camera.position.set(0, 0, 20);
let renderer = new THREE.WebGLRenderer();

function keyDown(dir: string) {
	if (dir == 'ArrowUp')
		upBar1Bool = 1;
	else if (dir == 'ArrowDown')
		downBar1Bool = -1;
	else if (dir == 'KeyT')
		upBar2Bool = 1;
	else
		downBar2Bool = -1;
}
function keyUp(dir: string) {
	if (dir == 'ArrowUp')
		upBar1Bool = 0;
	else if (dir == 'ArrowDown')
		downBar1Bool = 0;
	else if (dir == 'KeyT')
		upBar2Bool = 0;
	else
		downBar2Bool = 0;
}


function init() {
	// ADD EDGES LINES
	// const geometry2 = new THREE.BoxGeometry( 3, 3, 3 );
	// const edges = new THREE.EdgesGeometry( geometry2 );
	// const line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 10 } ) );
	// scene.add( line );

	// // ADD 3D MODEL
	// loader = new GLTFLoader();
	// // console.log('pwd = ', process.cwd());
	// // loader.load( '/Users/tdayde/Documents/TRANSCENDENCE_42/pong/formes_blender/terrain.glb', function ( gltf ) {
	// loader.load( './terrain.glb', function ( gltf ) {
	// 	scene.add( gltf.scene );
	// }, undefined, function ( error ) {
		// 	console.error( error );
	// } );
	let container = document.getElementById('scene-container');

	field = new FieldBorders(width, height, border, 0x16638D);
	// plane = new FieldPlane(width, height, 0xE5F4FB);
	bar1 = new PlayerBar(1, width, border, 0x000000);
	bar2 = new PlayerBar(2, width, border, 0x000000);
	ball = new Ball(0.2, 0xF5E400);
	ball.speedX = -0.005;
	ball.speedY = -0.001;

	scene.add( field.mesh, bar1.mesh, bar2.mesh, ball.mesh );


	renderer.setSize(container!.clientWidth, container!.clientHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	container!.append(renderer.domElement);
	renderer.render(scene, camera);

	document.addEventListener('keydown', function(event){
		const e = event as KeyboardEvent;
		// console.log('e.code = ', e.code);
		if (e.code == 'ArrowDown' || e.code == 'ArrowUp' || e.code == 'KeyT' || e.code == 'KeyG')
			keyDown(e.code);
	})
	document.addEventListener('keyup', function(event){
		const e = event as KeyboardEvent;
		// console.log('e.code = ', e.code);
		if (e.code == 'ArrowDown' || e.code == 'ArrowUp' || e.code == 'KeyT' || e.code == 'KeyG')
			keyUp(e.code);
	})
	YBarBorder = (height / 2) - border - (bar1.geometry.parameters.height / 2);
	XBallBorder = bar2.mesh.position.x - bar2.geometry.parameters.width / 2 - ball.geometry.parameters.radius;
	YBallBorder = height / 2 - border - ball.geometry.parameters.radius;
	contactBarLimit = bar1.geometry.parameters.height / 2 + ball.geometry.parameters.radius;
	microtime1 = performance.now();
}

onMounted( () => {
	init();
	animate();
})

function mooveBar1 (elapsed: number ) {
	let newPos = bar1.mesh.position.y + (upBar1Bool + downBar1Bool) * elapsed * barSpeed;
	if (newPos < YBarBorder && newPos > -YBarBorder )
		bar1.mesh.position.y = newPos;
	else if (newPos >= YBarBorder)
		bar1.mesh.position.y = YBarBorder;
	else
		bar1.mesh.position.y = - YBarBorder;
}

function mooveBar2 (elapsed: number ) {
	let newPos = bar2.mesh.position.y + (upBar2Bool + downBar2Bool) * elapsed * barSpeed;
	if (newPos < YBarBorder && newPos > -YBarBorder )
		bar2.mesh.position.y = newPos;
	else if (newPos >= YBarBorder)
		bar2.mesh.position.y = YBarBorder;
	else
		bar2.mesh.position.y = - YBarBorder;
}

function contactBallBar (newPos: BallPos) {
	if (newPos.x >= XBallBorder){
		ball.mesh.position.x = XBallBorder;
		updateBallSpeed(bar2);
	}
	else {
		ball.mesh.position.x = -XBallBorder;
		updateBallSpeed(bar1);
	}
}

function contactBallBorder (newPos: BallPos) {
	if (newPos.y >= YBallBorder)
		ball.mesh.position.y = YBallBorder;
	else
		ball.mesh.position.y = -YBallBorder;
	ball.speedY *= -1;
}

function updateBallSpeed (bar : PlayerBar) {
	ball.speedY = ((ball.mesh.position.y - bar.mesh.position.y) / contactBarLimit) * 0.01;
	if (ball.speedX < 0)
		ball.speedX -= 0.0005;
	else
		ball.speedX += 0.0005;
	ball.speedX *= -1;

	// console.log(angle);
	// console.log('contactBarLimit = ', contactBarLimit);
}

function mooveBall (elapsed: number) {
	let newPos: BallPos = { x: ball.mesh.position.x + elapsed * ball.speedX, y: ball.mesh.position.y + elapsed * ball.speedY };

	if ((ball.speedX > 0 && newPos.x > XBallBorder &&
		newPos.y > bar2.mesh.position.y - contactBarLimit &&
		newPos.y < bar2.mesh.position.y + contactBarLimit) ||
		(ball.speedX < 0 && newPos.x < -XBallBorder &&
		newPos.y > bar1.mesh.position.y - contactBarLimit &&
		newPos.y < bar1.mesh.position.y + contactBarLimit) )
		contactBallBar(newPos);
	// if (newPos.y > bar1.mesh.position.y - contactBarLimit &&
	// 	newPos.y < bar1.mesh.position.y + contactBarLimit)
	// 	contactBallBar(newPos);
	else if (newPos.y > YBallBorder || newPos.y < -YBallBorder)
		contactBallBorder(newPos);
	// else if ((newPos.x < XBallBorder && newPos.x > -XBallBorder) && (newPos.y < YBallBorder && newPos.y > -YBallBorder)) {
	else {
		ball.mesh.position.x = newPos.x;
		ball.mesh.position.y = newPos.y;
	}
	if ( ball.mesh.position.x > width / 2 + ball.geometry.parameters.radius) {
		Player2.value.points++;
		ball.mesh.position.x = 0;
		ball.mesh.position.y = 0;
		ball.speedX = -0.005;
		ball.speedY = -0.001;
		console.log('POINT Player 2!')
	}

	else if (ball.mesh.position.x < -width / 2 - ball.geometry.parameters.radius) {
		Player1.value.points++;
			ball.mesh.position.x = 0;
		ball.mesh.position.y = 0;
		ball.speedX = -0.005;
		ball.speedY = -0.001;
		console.log('POINT Player 1!')
	}

	// if (contact)
	// 	ball.mesh.position.y = ball.mesh.position.y;
	// else if (newPos.y < YBallBorder && newPos.y > -YBallBorder)
	// 	ball.mesh.position.y = newPos.y;
	// else if (contactBallBorder(newPos)) {
	// 	if (newPos.y >= YBallBorder)
	// 		ball.mesh.position.y = YBallBorder;
	// 	else
	// 		ball.mesh.position.y = -YBallBorder;
	// 	ball.speedY *= -1;
	// }

		// updateBallSpeed(newPos);
}

function animate() {
	microtime2 = performance.now();
	let elapsed = microtime2 - microtime1;
	mooveBar1(elapsed);
	mooveBar2(elapsed);
	mooveBall(elapsed);

	// console.log('barY = ', bar1.mesh.position.y);
	microtime1 = microtime2;
	renderer.render(scene, camera);
	IDanimation = window.requestAnimationFrame(animate);
}

</script>


<style scoped>
	#scene-container {
		margin:auto;
		height: 400px;
		width: 600px;
	}
</style>

