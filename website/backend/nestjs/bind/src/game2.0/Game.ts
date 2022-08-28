import Field from "./objects/Field";
import Ball from "./objects/Ball";
import Wall from "./objects/Wall";
import Racket from "./objects/Racket";
import Vector from 'src/game2.0/objects/Vector';
import { Logger } from '@nestjs/common';
import {GameDto} from './dto/GameDto';
import {BallDto} from './dto/BallDto';
import {WallDto} from './dto/WallDto';

export default class Game {
	nbrPlayer: number;
	nbrBall: number;
	start: boolean;
	run: boolean;
	balls: Array<Ball>;
	walls: Map<number, Wall>;
	objects: Array<any>
	deltaTime: number;
	logger: Logger;
	dto: GameDto;
	constructor(nbrPlayer: number, nbrBall: number, private server: any) {
		this.start = true;
		this.run = true;
		this.nbrBall = nbrBall;
		this.nbrPlayer = nbrPlayer;
		this.balls = [];
		this.objects = [];
		this.deltaTime = 1;
		this.logger = new Logger();
		this.init();
		this.dto = new GameDto(5, 1);
		this.setDto();
	}
	init() {
		let players = ["zeus", "Toto", "Jj"];
		let radius = 410;
		let field = new Field(this.nbrPlayer);
		for (let i = 0; i < this.nbrBall; ++i) {
			if (i % 2 == 1)
				this.balls.push(new Ball(radius, radius + (-i / 2) * 30 - 7.5));
			else this.balls.push(new Ball(radius, radius + (i / 2) * 30 + 7.5));
		}
		this.walls = field.getWalls();
		let fieldPoints: Array<number> = [];
		this.walls.forEach((wall) => {
			fieldPoints.push(wall.x);
			fieldPoints.push(wall.y);
		});
		let rack: Racket;
		let i = 0;
		this.walls.forEach((wall) => {
			this.objects.push(wall);
			if (wall.side) {
				let tmp = wall.getRacket();
				this.objects.push(tmp);
				if (wall.angle == 0) rack = tmp;
				i++;
			}
		});

		let mov = 0;
		this.loop();
	}
	setDto() {
		let i = 0;
		this.dto.start = this.start;
		for (i = 0; i < this.balls.length; ++i) {
			if (!this.dto.balls[i])
				this.dto.balls[i] = new BallDto();
			this.dto.balls[i].v = this.balls[i].v;
			this.dto.balls[i].x = this.balls[i].x;
			this.dto.balls[i].y = this.balls[i].y;
		}
		i = 0;
		this.walls.forEach((wall) => {
			if (!this.dto.walls[i])
				this.dto.walls[i] = new WallDto();
			this.dto.walls[i].x = wall.x;
			this.dto.walls[i].y = wall.y;
			this.dto.walls[i].w = wall.width;
			this.dto.walls[i].h = wall.height;
			this.dto.walls[i].rotation = wall.angle;
			++i;
		});
	}
	stop() {
		this.run = false;
	}
	async loop() {
		let start = await performance.now();
		for (let o in this.objects) {
			this.logger.log(this.objects[Number(o)].vector.x)
		}
		while (this.run) {
			if (this.start)
				for (let i = 0; i < this.nbrBall; ++i) {
					let ball = this.balls[i];
					ball.detectCollision(this.objects);
					// this.logger.log(this.objects);
					ball.x = ball.x + ball.v.x * ball.speed * this.deltaTime;
					ball.y = ball.y + ball.v.y * ball.speed * this.deltaTime;
				}
			// if (
			// 	rack.y() + mov * this.deltaTime > walls.get(0)!.y &&
			// 	rack.y() + mov * this.deltaTime <
			// 	walls.get(0)!.y + (walls.get(0)!.width / 4) * 3
			// )
			// 	rack.y(rack.y() + mov * this.deltaTime);
			this.setDto();
			this.server.emit('game', JSON.stringify(this.dto));
			let end = await performance.now();
			this.deltaTime = end - start;
			this.deltaTime /= 1000;
			this.deltaTime *= 60;
			start = end;
			await delay(1);
		}
	}
}
// let scale = walls.get(0)!.width / 100;
// container.addEventListener("keydown", function (e) {
// 	if (e.key == "ArrowLeft") {
// 		mov = -scale * walls.get(0)!.racket!.speed;
// 	} else if (e.key == "ArrowRight") {
// 		mov = scale * walls.get(0)!.racket!.speed;
// 		// if (e.key == "ArrowUp") {
// 		// 	ball.y(ball.y() - delta);
// 		// } else if (e.key == "ArrowDown") {
// 		// 	ball.y(ball.y() + delta);
// 		// } else if (e.key == "ArrowLeft") {
// 		// 	ball.x(ball.x() - delta);
// 		// } else if (e.key == "ArrowRight") {
// 		// 	ball.x(ball.x() + delta);
// 	} else {
// 		return;
// 	}
// 	e.preventDefault();
// });

const delay = (time: number) =>
	new Promise((resolve) => setTimeout(resolve, time));
