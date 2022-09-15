import Vector from './Vector';
import Racket from './Racket';
import Profile from './Profile';

export default class Wall {
	vector: Vector;
	width: number;
	height: number;
	side: boolean;
	x: number;
	y: number;
	angle: number;
	index: number;
	racket?: Racket;
	profile?: Profile;
	constructor(
		width: number,
		vector: Vector,
		side: boolean,
		coordonate: Vector,
		index: number,
		nbrWall: number,
	) {
		this.vector = vector;
		this.width = 7;
		this.height = width;
		this.side = side;
		this.index = index;
		this.x = coordonate.x;
		this.y = coordonate.y;
		this.angle = index * (360 / nbrWall);
		if (this.side) {
			this.racket = new Racket(this);
		}
	}
	getRacket() {
		return this.racket;
	}
}
