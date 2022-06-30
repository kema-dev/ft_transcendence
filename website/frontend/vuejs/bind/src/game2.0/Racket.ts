import Vector from '@/game2.0/Vector';
import Konva from 'konva';
import Wall from '@/game2.0/Wall';

export default class Racket {
	vector: Vector;
	width: number;
	x: number;
	y: number;
	angle: number
	constructor(wall: Wall) {
		this.vector = wall.vector
		this.width = wall.width / 4
		this.x = wall.x
		this.y = wall.y
		this.x += wall.vector.x * 10
		this.y += wall.vector.y * 10
		this.angle = wall.angle
	}
	getKonva() {
		return new Konva.Rect({
			x: this.x,
			y: this.y,
			rotation: this.angle,
			width: 7,
			height: this.width,
			fill: "#16638D",
		});
	}
}
