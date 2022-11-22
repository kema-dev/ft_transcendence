/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger } from '@nestjs/common';
import { profile } from 'console';
import { disconnect } from 'process';
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
		this.initSpeed = 0.5;
		this.speed = this.initSpeed;
		this.start();
	}
	async start() {
		this.speed = 0;
		this.touch = 0;
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
	detectCollision(objects: Array<any>) {
		for (let i = 0; i < objects.length; ++i) {
			const object = objects[i];
			if (!object || object == this) return false;
			// const wall = walls.get(object.rotation);
			// this.logger.log(object.angle)
			// if (!wall)
			// 	return;
			// check collision
			// console.log(this.v.dotProduct(object.vector));
			if (
				this.v.dotProduct(object.vector) < 0
				&& ((object.index == undefined && detectCollisionRC(object, this)) ||
					(object.index != undefined && this.detectCollisionWall(object, this)))
			) {
				const v = object.vector;
				this.touch++;
				if (this.touch >= 60) this.start();
				if (this.speed < this.initSpeed * 3) this.speed += this.initSpeed * 0.10;
				this.v = this.v.add(v.multiplication(v.dotProduct(this.v.reverse()) * 2));
				// check if is wall or racket for the score
				if (object.side) {
					object.profile.red = true;
					object.profile.score -= 1;
					this.start().then(() => {
						object.profile.red = false;
					});
					if (object.profile.score <= 0) {
						return object.profile.login;
					}
				}
			}
		}
	}
	detectCollisionRacket(rect: Racket, circle: Ball) {
		let dist = rect.vector.x * circle.x + rect.vector.y * circle.y + rect.d;
		// console.log(dist);
		if (dist < circle.r) return true;
		return false;
	}
	detectCollisionWall(rect: Wall, circle: Ball) {
		const centerToBall: Vector = new Vector(circle.x - this.startX, circle.y - this.startY);
		// -(a * centerAera.x + b * centerAera.y + d) / (a * v.x + b * v.y)
		let sizeToCollideWall: number = -(rect.vector.x * this.startX + rect.vector.y * this.startY + rect.d) / (rect.vector.x * centerToBall.x + rect.vector.y * centerToBall.y);
		console.log(sizeToCollideWall);
		if (sizeToCollideWall >= 0 && sizeToCollideWall <= 1.065)
			return true;
		return false;
	}
	isOutofAera(ball: Ball, wall: Wall): CheckCollide {
		const centerToBall: Vector = new Vector(ball.x - this.startX, ball.y - this.startY);
		const sizeToCollideWall: number = Math.round(-(wall.vector.x * this.startX + wall.vector.y * this.startY + wall.d) / (wall.vector.x * centerToBall.x + wall.vector.y * centerToBall.y));

		if (sizeToCollideWall >= 0 && sizeToCollideWall < 1)
			return CheckCollide.OutofAera;
		else if (sizeToCollideWall == 1)
			return CheckCollide.Collide;
		else if (sizeToCollideWall > 1 && sizeToCollideWall < 2)
			return CheckCollide.closeToTheRacket;
		return CheckCollide.None;
	}
}

enum CheckCollide {
	None,
	closeToTheRacket,
	Collide,
	OutofAera
}

function detectCollisionRC(rect: Racket, circle: Ball) {
	let cx, cy;
	// console.log(rect.angle, circle.x, circle.y, rect.x, rect.y);
	const angleOfRad = degToRad(-rect.angle);
	if (typeof rect === typeof Wall) {
		rect.height += 400;
	}
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
	if (distance(rotateCircleX, rotateCircleY, cx, cy) < circle.r)
		return true;
	return false;
}
function distance(x1: number, y1: number, x2: number, y2: number) {
	// console.log(x1, y1, x2, y2);
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
function degToRad(deg: number) {
	return (deg * Math.PI) / 180;
}
