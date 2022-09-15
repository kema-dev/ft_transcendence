/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger } from '@nestjs/common';
import { GameDto } from '../dto/GameDto';
import Racket from '../objects/Racket';
import Vector from './Vector';
import Wall from './Wall';

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
export default class Ball {
	x: number;
	y: number;
	startX: number;
	startY: number;
	r: number;
	v: Vector;
	speed: number;
	initSpeed: number;
	touch: number;
	logger: Logger;
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.startX = x;
		this.startY = y;
		this.r = 10;
		this.v = new Vector(0, 0);
		this.logger = new Logger();
		this.touch = 0;
		this.initSpeed = 8;
		this.speed = this.initSpeed;
		this.start();
	}
	async start() {
		this.speed = 0;
		this.x = this.startX;
		this.y = this.startY;
		await delay(1000);
		this.speed = this.initSpeed;
		let ballX = Math.random() * 5;
		let ballY = 5 - ballX;
		if (Math.floor(Math.random() * 2) == 1) ballX = -ballX;
		if (Math.floor(Math.random() * 2) == 1) ballY = -ballY;
		this.v = new Vector(ballX, ballY);
		this.v.normalize();
	}
	detectCollision(objects: Array<any>): boolean {
		for (let i = 0; i < objects.length; ++i) {
			const object = objects[i];
			if (!object || object == this) return false;
			// const wall = walls.get(object.rotation);
			// this.logger.log(object.angle)
			// if (!wall)
			// 	return;
			// check collision
			if (
				this.v.dotPorduct(object.vector) < 0 &&
				detectCollisionRC(object, this)
			) {
				const v = object.vector;
				this.touch++;
				if (this.touch >= 30) this.start();
				if (this.speed < this.initSpeed * 3) this.speed += this.initSpeed / 10;
				this.v = this.v.add(
					v.multiplication(v.dotPorduct(this.v.reverse()) * 2),
				);
				// check if is wall or racket for the score
				if (object.side) {
					object.profile.red = true;
					object.profile.score -= 1;
					this.start().then(() => {
						object.profile.red = false;
					});
					if (object.profile.score <= 0) {
						return true;
					}
				}
			}
		}
	}
}
function detectCollisionRC(rect: Wall | Racket, circle: Ball) {
	let cx, cy;
	const angleOfRad = degToRad(-rect.angle);
	// const rectCenterX = rect.x + rect.height / 2;
	// const rectCenterY = rect.y + rect.width / 2;
	const rectCenterX = rect.x;
	const rectCenterY = rect.y;

	const rotateCircleX =
		Math.cos(angleOfRad) * (circle.x - rectCenterX) -
		Math.sin(angleOfRad) * (circle.y - rectCenterY) +
		rectCenterX;
	const rotateCircleY =
		Math.sin(angleOfRad) * (circle.x - rectCenterX) +
		Math.cos(angleOfRad) * (circle.y - rectCenterY) +
		rectCenterY;

	if (rotateCircleX < rect.x) {
		cx = rect.x;
	} else if (rotateCircleX > rect.x + rect.width) {
		cx = rect.x + rect.width;
	} else {
		cx = rotateCircleX;
	}

	if (rotateCircleY < rect.y) {
		cy = rect.y;
	} else if (rotateCircleY > rect.y + rect.height) {
		cy = rect.y + rect.height;
	} else {
		cy = rotateCircleY;
	}
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
