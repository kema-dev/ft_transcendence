import Vector from "@/game2.0/Vector"
import Racket from "@/game2.0/Racket"
import Konva from "konva"
import Profile from "@/game2.0/Profile"

export default class Wall {
	vector: Vector;
	width: number;
	side: boolean;
	x: number;
	y: number;
	angle: number;
	index: number;
	racket?: Racket;
	scoreKonva?: Konva.Text;
	profile?: Profile;
	constructor(width: number, vector: Vector, side: boolean, coordonate: Vector, index: number, nbrWall: number) {
		this.vector = vector;
		this.width = width;
		this.side = side;
		this.index = index;
		this.x = coordonate.x;
		this.y = coordonate.y;
		this.angle = index * (360 / nbrWall);
		// console.log(this.angle + " = x:" + this.x + " y: " + this.y)
		if (this.side) {
			this.profile = new Profile(this, nbrWall / 2);
			this.racket = new Racket(this)
		}
	}
	getKonvaRacket() {
		return this.racket!.getKonva()
	}
	getKonva() {
		const rec = new Konva.Rect({
			x: this.x,
			y: this.y,
			rotation: this.angle,
			width: 7,
			height: this.width,
			fill: "#16638D",
		});
		// rec.on("pointerover", () => {
		// 	console.log(this.index)
		// })
		return rec
	}
	getKonvaProfile(name: string) {
		if (!this.profile) {
			console.log("error");
			return ;
		}
		this.scoreKonva = this.profile.getKonvaScore();
		return this.profile.getKonva(name);
	}
}
