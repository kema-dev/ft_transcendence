import Vector from '@/game2.0/Vector'
import Wall from '@/game2.0/Wall'
import Konva from "konva"

function delay(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
export default class Ball {
	x: number;
	y: number;
	startX: number;
	startY: number;
	r: number;
	v: Vector;
	speed: number;
	konva: Konva.Circle;
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.startX = x;
		this.startY = y;
		this.r = 10;
		this.v = new Vector(0, 0);
		this.speed = 3;
		this.konva = new Konva.Circle({
			x: this.x,
			y: this.y,
			radius: this.r,
			fill: "#16638D",
		})
		this.start()
	}
	async start() {
		this.speed = 0;
		await delay(1000);
		this.konva.x(this.startX);
		this.konva.y(this.startY);
		this.speed = 3;
		let ballX = Math.random() * 5;
		let ballY = 5 - ballX;
		if (Math.floor(Math.random() * 2) == 1) ballX = -ballX;
		if (Math.floor(Math.random() * 2) == 1) ballY = -ballY;
		this.v = new Vector(ballX, ballY);
		this.v.normalize();
	}
	getKonva() {
		return this.konva
	}
	detectCollision(objects: Konva.Group, walls: Map<number, Wall>) {
		for (let i = 0; i < objects.children!.length; ++i) {
			if (objects.children![i] == this.konva) return;
			const wall = walls.get(objects.children![i].rotation());
			if (!wall)
				return;
			// check collision
			if (this.v.dotPorduct(wall!.vector) < 0 && detectCollisionRC(objects.children![i], this.konva)) {
				const v = wall.vector;
				if (this.speed < 8)
					this.speed += 0.1
				this.v = this.v.add(
					v.multiplication(v.dotPorduct(this.v.reverse()) * 2));
				// check if is wall or racket for the score
				if (objects.children![i].height() == wall.width && wall.side) {
					if (wall.scoreKonva) {
						wall.scoreKonva.text((Number(wall.scoreKonva.text()) - 1).toString());
						// if (Number(wall.scoreKonva.text()) <= 0) {
						// 	this.
						// }
					}
					wall.racket!.speed = 0;
					this.start().then(() => {wall.racket!.speed = 1;});
					// wall.racket!.speed = 1;
				}
			}
		}
	}
}
function detectCollisionRC(
	rect: Konva.Group | Konva.Shape,
	circle: Konva.Circle
) {
	let cx, cy;
	const angleOfRad = degToRad(-rect.rotation());
	// const rectCenterX = rect.x + rect.w / 2;
	// const rectCenterY = rect.y + rect.h / 2;
	const rectCenterX = rect.x();
	const rectCenterY = rect.y();

	const rotateCircleX =
		Math.cos(angleOfRad) * (circle.x() - rectCenterX) -
		Math.sin(angleOfRad) * (circle.y() - rectCenterY) +
		rectCenterX;
	const rotateCircleY =
		Math.sin(angleOfRad) * (circle.x() - rectCenterX) +
		Math.cos(angleOfRad) * (circle.y() - rectCenterY) +
		rectCenterY;

	if (rotateCircleX < rect.x()) {
		cx = rect.x();
	} else if (rotateCircleX > rect.x() + rect.width()) {
		cx = rect.x() + rect.width();
	} else {
		cx = rotateCircleX;
	}

	if (rotateCircleY < rect.y()) {
		cy = rect.y();
	} else if (rotateCircleY > rect.y() + rect.height()) {
		cy = rect.y() + rect.height();
	} else {
		cy = rotateCircleY;
	}
	if (distance(rotateCircleX, rotateCircleY, cx, cy) < circle.radius()) {
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
