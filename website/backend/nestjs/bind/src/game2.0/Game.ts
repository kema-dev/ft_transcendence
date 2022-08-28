import Field from "./objects/Field";
import Ball from "./objects/Ball";
import Wall from "./objects/Wall";
import Racket from "./objects/Racket";
import Vector from 'src/game2.0/objects/Vector';
import { Logger } from '@nestjs/common';
import { GameDto } from './dto/GameDto';
import { BallDto } from './dto/BallDto';
import { WallDto } from './dto/WallDto';
import { RacketDto } from 'src/game2.0/dto/RacketDto';

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
	mov: number;
	rackets: Racket[];
	constructor(nbrPlayer: number, nbrBall: number, private server: any) {
		this.start = true;
		this.run = true;
		this.nbrBall = nbrBall;
		this.nbrPlayer = nbrPlayer;
		this.balls = [];
		this.objects = [];
		this.deltaTime = 1;
		this.mov = 0;
		this.rackets = [];
		this.logger = new Logger();
		this.dto = new GameDto(nbrPlayer, nbrBall);
		this.init();
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
		let i = 0;
		this.walls.forEach((wall) => {
			this.objects.push(wall);
			if (wall.side) {
				let tmp = wall.getRacket();
				this.objects.push(tmp);
				if (wall.angle == 0) this.rackets.push(tmp);
				i++;
			}
		});
		this.loop();
	}
	setDto() {
		let i = 0;
		this.dto.start = this.start;
		for (i = 0; i < this.balls.length; ++i) {
			if (!this.dto.balls[i])
				this.dto.balls[i] = new BallDto();
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
		for (let i in this.rackets) {
			if (!this.dto.rackets[i])
				this.dto.rackets[i] = new RacketDto();
			this.dto.rackets[i].x = this.rackets[i].x;
			this.dto.rackets[i].y = this.rackets[i].y;
			this.dto.rackets[i].h = this.rackets[i].height;
			this.dto.rackets[i].w = this.rackets[i].width;
		}
	}
	setMinimumDto() {

	}
	setMov(value: number) {
		this.mov = value * this.walls.get(0)!.width / 100 * this.walls.get(0)!.racket!.speed;
	}
	stop() {
		this.run = false;
	}
	async loop() {
		let start = await performance.now();
		for (let o in this.objects) {
			this.logger.log(this.objects[Number(o)].angle)
		}
		while (this.run) {
			if (this.start)
				for (let ball of this.balls) {
					ball.detectCollision(this.objects);
					// this.logger.log(this.objects);
					ball.x = ball.x + ball.v.x * ball.speed * this.deltaTime;
					ball.y = ball.y + ball.v.y * ball.speed * this.deltaTime;
				}
			for (let rack of this.rackets)
			if (
				this.rackets[0].y + this.mov * this.deltaTime > this.walls.get(0)!.y &&
				this.rackets[0].y + this.mov * this.deltaTime <
				this.walls.get(0)!.y + (this.walls.get(0)!.width / 4) * 3
			)
				this.rackets[0].y = this.rackets[0].y + this.mov * this.deltaTime;
			await this.setDto();
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
