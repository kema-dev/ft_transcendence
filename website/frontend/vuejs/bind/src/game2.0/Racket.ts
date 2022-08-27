import Vector from '@/game2.0/Vector';
import Konva from 'konva';
import Wall from '@/game2.0/Wall';

export default class Racket {
	width: number;
	x: number;
	y: number;
	angle: number;
	speed: number;

	constructor(wall: Wall) {
		this.width = wall.width / 4
		this.x = wall.x
		this.y = wall.y
		this.x += wall.vector.x * 10
		this.y += wall.vector.y * 10
		this.angle = wall.angle
		this.speed = 2.56;
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
