import Vector from './Vector';
import Wall from './Wall';

export default class Field {
	nbrPlayer: number;
	nbrWall: number;
	walls: Array<Wall>;
	angleBase: number;
	radius: number;
	solo: boolean;
	constructor(nbrPlayer: number) {
		this.nbrPlayer = nbrPlayer;
		this.nbrWall = nbrPlayer * 2;
		if (this.nbrPlayer == 1) {
			this.solo = true;
			this.nbrWall = 4;
		}
		this.angleBase = (Math.PI * 2) / this.nbrWall;
		this.radius = 410;
		const centerPos = new Vector(this.radius, this.radius);
		this.walls = []
		const v = new Vector(1, 0);
		const distanceToWall = this.radius * Math.cos(this.angleBase / 2);
		const halfFaceLength = this.radius * Math.sin(this.angleBase / 2);
		const pos = new Vector(-distanceToWall, -halfFaceLength);
		for (let i = 0; i < this.nbrWall; ++i) {
			let racket = false;
			if (i % 2 == 0)
				racket = true;
			if (i == 2 && this.solo)
				racket = false;
			this.walls.push(new Wall(2 * halfFaceLength, v.clone(), racket, pos.add(centerPos), i, this.nbrWall))
			v.rotate(this.angleBase)
			pos.rotate(this.angleBase)
		}
	}
}
