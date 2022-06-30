import Vector from '@/game2.0/Vector';
import Wall from "@/game2.0/Wall"
import Konva from "konva"

export default class Field {
	nbrPlayer: number;
	nbrWall: number
	walls: Array<Wall>
	angleBase: number
	radius: number
	constructor(nbrPlayer: number) {
		this.nbrPlayer = nbrPlayer;
		this.nbrWall = nbrPlayer * 2
		this.angleBase = Math.PI * 2 / this.nbrWall
		this.radius = 350;
		const centerPos = new Vector(this.radius, this.radius);
		this.walls = []
		// const v = new Vector(-1, 0)
		// const distanceToWall = this.radius * Math.cos(this.angle / 2);
		// const halfFaceLength = this.radius * Math.sin(this.angle / 2);
		// const pos = new Vector(distanceToWall, -halfFaceLength);
		const v = new Vector(1, 0);
		const distanceToWall = this.radius * Math.cos(this.angleBase / 2);
		const halfFaceLength = this.radius * Math.sin(this.angleBase / 2);
		const pos = new Vector(-distanceToWall, -halfFaceLength);
		// v.rotate(90)
		// pos.rotate(90)
		for (let i = 0; i < this.nbrWall; ++i) {
			this.walls.push(new Wall(2 * halfFaceLength, v.clone(), false, pos.add(centerPos), i, this.nbrWall))
			// console.log("before: x:" + v.x + " y:" + v.y)
			v.rotate(this.angleBase)
			// console.log("after: x:" + v.x + " y:" + v.y)
			pos.rotate(this.angleBase)
		}
	}
	getWalls() {
		const map = new Map<number, Wall>();
		this.walls.forEach((wall) => {
			map.set(wall.angle, wall)
		})
		return map
	}
	getLayer() {
		const layer = new Konva.Layer();
		this.walls.forEach((wall) => {
			layer.add(wall.getKonva())
			if (wall.side) {
				layer.add(wall.getKonvaRacket())
			}
		})
		return layer
	}
}



















		// this.nbrPlayer = nbrPlayer;
		// this.nbrWall = nbrPlayer * 2;
		// let baseAngle = 2 * Math.PI / this.nbrWall;
		// this.radius = 350;
		// centerPos = new Vector(this.radius, this.radius);
		// let ditanceToWall = this.radius * Math.cos(baseAngle / 2);
		// let halfFaceLength = this.radius * Math.sin(baseAngle / 2);
		// let pos = new Vector(ditanceToWall, halfFaceLength);
		// let v =  new Vector(-1, 0);
		// for (let i = 0; i < this.nbrWall; ++i) {
		// 	this.walls.push(new Wall(pos.add(centerPos), v));
		// 	pos.rotate(baseAngle);
		// 	v.rotate(baseAngle);
		// }


// 	}

// }
