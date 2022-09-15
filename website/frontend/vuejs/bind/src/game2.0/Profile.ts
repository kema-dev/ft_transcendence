import ProfileDto from '@/dto/ProfileDto';
import Konva from "konva";

export default class Profile {
	konvaScore: Konva.Text;
	konvaBackground: Konva.Rect;
	konvaRound: Konva.Rect;
	konva: Konva.Group;
	constructor(profile: ProfileDto, rotation: number) {
		this.konva = new Konva.Group({
			x: profile.x,
			y: profile.y,
			rotation: -rotation,
		});
		let w = 100;
		let h = 60;
		this.konva.add(
			this.konvaBackground = new Konva.Rect({
				width: h,
				height: w,
				offsetX: h / 2,
				offsetY: w / 2,
				strokeWidth: 3,
				stroke: "#16638D",
				fill: "#E5F4FB",
				cornerRadius: 100,
			})

		);
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
		this.konva.add(
			this.konvaRound = new Konva.Rect({
				width: h,
				height: w,
				offsetX: h / 2,
				offsetY: w / 2,
				y: -20,
				strokeWidth: 3,
				stroke: "#16638D",
				cornerRadius: 100,
			})
		);
		w = 25;
		h = 25;
		this.konva.add(
			this.konvaScore = new Konva.Text({
				width: h,
				height: w,
				offsetX: h / 2,
				offsetY: w / 2,
				y: 28,
				text: profile.score.toString(),
				fontSize: 25,
				fontFamily: "Orbitron",
				fontStyle: "bold",
				fill: "#16638D",
				align: "center",
				rotation: 90,
			})
		);
		w = 20;
		h = 80;
		this.konva.add(
			new Konva.Text({
				width: h,
				height: w,
				offsetX: h / 2,
				offsetY: w / 2,
				x: 40,
				text: profile.login,
				fontSize: 18,
				fontFamily: "Orbitron",
				fontStyle: "bold",
				fill: "#16638D",
				align: "center",
				rotation: 90,
			})
		);
		w = 58;
		h = 58;
		const pp = new Konva.Group({
			clipFunc: function (ctx) {
				ctx.arc(0, -20, w / 2, 0, Math.PI * 2, false);
			},
		});
		const imageObj = new Image();
		imageObj.onload = function () {
			const img = new Konva.Image({
				width: h,
				height: w,
				offsetX: h / 2,
				offsetY: w / 2,
				cornerRadius: 100,
				y: -20,
				image: imageObj,
				rotation: 90,
			});
			pp.add(img);
		};
		this.konva.add(pp);
		imageObj.src = profile.avatar;
	}
}
