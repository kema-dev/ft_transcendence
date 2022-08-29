import e from 'express';
import Vector from './Vector';
import Wall from './Wall';

export default class Racket {
	width: number;
	height: number;
	x: number;
	y: number;
	vector: Vector;
	angle: number;
	speed: number;
	wall: Wall;
	max: Vector;
	constructor(wall: Wall) {
		this.width = wall.width;
		this.height = wall.height / 4;
		this.vector = wall.vector;
		this.vector.normalize();
		this.x = wall.x
		this.y = wall.y
		this.x += wall.vector.x * 10
		this.y += wall.vector.y * 10
		this.angle = wall.angle
		this.speed = 2.56;
		this.wall = wall;
		if (this.angle < 90)
			this.max = new Vector(this.x, this.x + -this.vector.y * wall.height);
		else if (this.angle < 180)
			this.max = new Vector(this.y + this.vector.x * wall.height, this.y);
		else if (this.angle < 270)
			this.max = new Vector(this.x + -this.vector.y * wall.height, this.x);
		else
			this.max = new Vector(this.y, this.y + this.vector.x * wall.height);
	}
}
