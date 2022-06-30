import Konva from "konva"

export default class Ball {
	x: number
	y: number
	r: number
	constructor(x: number, y: number) {
		this.x = x
		this.y = y
		this.r = 10
	}
	getKonva() {
		return new Konva.Circle({
			x: this.x,
			y: this.y,
			radius: this.r,
			fill: "#16638D",
		})
	}
}
