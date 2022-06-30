export default class Vector {
	x: number
	y: number
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
	rotate(angle: number) {
		const tmp = this.x;
		this.x = this.x * Math.cos(angle) - this.y * Math.sin(angle);
		this.y = tmp * Math.sin(angle) + this.y * Math.cos(angle);
	}
	add(src: Vector) {
		return new Vector(this.x + src.x, this.y + src.y)
	}
	normalize() {
		const size = Math.sqrt(this.x ** 2 + this.y ** 2);
		this.x /= size;
		this.y /= size;
		this.x = Math.round(this.x * 100) / 100
		this.y = Math.round(this.y * 100) / 100
	}
	clone() {
		return new Vector(this.x, this.y)
	}
}
