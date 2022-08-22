import Konva from "konva";
import Wall from "@/game2.0/Wall";

export default class Profile {
	x: number;
	y: number;
	angle: number;
	nbrPlayer: number;
	konvaScore: Konva.Text;
	konvaBackground: Konva.Rect;
	konvaRound: Konva.Rect;

	constructor(wall: Wall, nbrPlayer: number) {
		this.x = wall.x;
		this.y = wall.y;
		this.x -= wall.vector.x * 55;
		this.y -= wall.vector.y * 60;
		this.y += (wall.vector.x * wall.width) / 2;
		this.x -= (wall.vector.y * wall.width) / 2;
		this.angle = wall.angle;
		this.nbrPlayer = nbrPlayer;
		let w = 25;
		let h = 25;
		this.konvaScore = new Konva.Text({
			width: h,
			height: w,
			offsetX: h / 2,
			offsetY: w / 2,
			y: 28,
			text: (10 - this.nbrPlayer).toString(),
			fontSize: 25,
			fontFamily: "Orbitron",
			fontStyle: "bold",
			fill: "#16638D",
			align: "center",
			rotation: 90,
		});
		w = 100;
		h = 60;
		this.konvaBackground = new Konva.Rect({
			width: h,
			height: w,
			offsetX: h / 2,
			offsetY: w / 2,
			strokeWidth: 3,
			stroke: "#16638D",
			fill: "#E5F4FB",
			cornerRadius: 100,
		});
		// this.konvaFilter = new Konva.Rect({
		// 	width: h,
		// 	height: w,
		// 	offsetX: h / 2,
		// 	offsetY: w / 2,
		// 	fill: "red",
		// 	cornerRadius: 100,
		// 	opacity: 0,
		// });
		w = 60;
		h = 60;
		this.konvaRound = new Konva.Rect({
			width: h,
			height: w,
			offsetX: h / 2,
			offsetY: w / 2,
			y: -20,
			strokeWidth: 3,
			stroke: "#16638D",
			cornerRadius: 100,
		});
	}
	getKonvaScore() {
		return this.konvaScore;
	}
	getKonva(name: string) {
		const profile = new Konva.Group({
			x: this.x,
			y: this.y,
		});
		let w = 20;
		let h = 80;
		profile.add(
			new Konva.Text({
				width: h,
				height: w,
				offsetX: h / 2,
				offsetY: w / 2,
				x: 40,
				text: name,
				fontSize: 18,
				fontFamily: "Orbitron",
				fontStyle: "bold",
				fill: "#16638D",
				align: "center",
				rotation: 90,
			})
		);
		profile.add(this.konvaBackground);
		profile.add(this.konvaScore);
		profile.add(this.konvaRound);
		w = 58;
		h = 58;
		const group = new Konva.Group({
			clipFunc: function (ctx) {
				ctx.arc(0, -20, w / 2, 0, Math.PI * 2, false);
			},
		});
		const imageObj = new Image();
		imageObj.onload = function () {
			const yoda = new Konva.Image({
				width: h,
				height: w,
				offsetX: h / 2,
				offsetY: w / 2,
				cornerRadius: 100,
				y: -20,
				image: imageObj,
				rotation: 90,
			});
			group.add(yoda);
			profile.add(group);
		};
		imageObj.src = require("../assets/avatars/(5).jpg");
		// profile.add(this.konvaFilter);
		return profile;
	}
}
