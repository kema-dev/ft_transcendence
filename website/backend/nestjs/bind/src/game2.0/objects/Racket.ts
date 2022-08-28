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
	constructor(wall: Wall) {
		this.width = wall.width / 4;
		this.height = wall.height;
		this.vector = wall.vector;
		this.x = wall.x
		this.y = wall.y
		this.x += wall.vector.x * 10
		this.y += wall.vector.y * 10
		this.angle = wall.angle
		this.speed = 2.56;
	}
}
