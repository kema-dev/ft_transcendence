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
import ProfileDto from 'src/game2.0/dto/ProfileDto';
import Profile from 'src/game2.0/objects/Profile';

export default class Game {
	nbrPlayer: number;
	nbrBall: number;
	start: boolean;
	run: boolean;
	balls: Array<Ball>;
	walls: Wall[];
	objects: Array<any>
	deltaTime: number;
	logger: Logger;
	dto: GameDto;
	rackets: Racket[];
	profiles: Profile[];
	players: string[];
	constructor(nbrPlayer: number, nbrBall: number, private server: any, players: string[]) {
		this.start = false;
		this.run = true;
		this.nbrBall = nbrBall;
		this.nbrPlayer = nbrPlayer;
		this.balls = [];
		this.objects = [];
		this.deltaTime = 1;
		this.rackets = [];
		this.profiles = [];
		this.players = players;
		this.logger = new Logger();
		this.dto = new GameDto(nbrPlayer, nbrBall);
		this.init();
		this.setDto();
		this.loop();
	}
	init() {
		let radius = 410;
		let field = new Field(this.nbrPlayer);
		for (let i = 0; i < this.nbrBall; ++i) {
			if (i % 2 == 1)
				this.balls.push(new Ball(radius, radius + (-i / 2) * 30 - 7.5));
			else this.balls.push(new Ball(radius, radius + (i / 2) * 30 + 7.5));
		}
		this.walls = field.walls;
		let fieldPoints: Array<number> = [];
		this.walls.forEach((wall) => {
			fieldPoints.push(wall.x);
			fieldPoints.push(wall.y);
		});
		let i = 0;
		this.walls.forEach((wall) => {
			this.objects.push(wall);
			if (wall.side) {
				let tmp = new Profile(this.players[i], 10 - this.nbrPlayer, wall);
				this.profiles.push(tmp);
				wall.profile = tmp;
				let tmp2 = wall.getRacket();
				this.objects.push(tmp2);
				this.rackets.push(tmp2);
				i++;
			}
		});
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
			this.dto.rackets[i].rotation = this.rackets[i].angle;
			this.dto.rackets[i].h = this.rackets[i].height;
			this.dto.rackets[i].w = this.rackets[i].width;
		}
		this.dto.profiles = this.profiles;
	}
	setMinimumDto() {
		this.dto.start = this.start;
		for (let i = 0; i < this.balls.length; ++i) {
			this.dto.balls[i].x = this.balls[i].x;
			this.dto.balls[i].y = this.balls[i].y;
		}
		for (let i in this.rackets) {
			this.dto.rackets[i].x = this.rackets[i].x;
			this.dto.rackets[i].y = this.rackets[i].y;
		}
		this.dto.profiles = this.profiles;
	}
	setMov(value: number, login: string) {
		for (let p of this.profiles)
			if (p.login == login) {
				p.mov = value * this.walls[0].height / 100 * this.rackets[0].speed;
				return;
			}
	}
	stop() {
		this.run = false;
	}
	async loop() {
		let start = await performance.now();
		while (this.run) {
			if (this.start)
				for (let ball of this.balls) {
					if (ball.detectCollision(this.objects)) {
						this.run = false;
					};
					ball.x = ball.x + ball.v.x * ball.speed * this.deltaTime;
					ball.y = ball.y + ball.v.y * ball.speed * this.deltaTime;
				}
			for (let i in this.profiles) {
				let mov = this.profiles[i].mov;
				if (mov == 0)
					continue;
				let rack = this.rackets[i];
				let x = rack.x + -rack.vector.y * this.deltaTime * mov;
				let y = rack.y + rack.vector.x * this.deltaTime * mov;
				this.logger.log(rack.vector.y)
				this.logger.log(rack.angle)
				rack.x = x;
				rack.y = y;
				// if (mov < 0) {
				// 	this.logger.log(y + " " + rack.max.x)
				// 	if (x >= rack.max.x) {
				// 		rack.x = x;
				// 		rack.y = y;
				// 	}
				// }
				// else {
				// 	this.logger.log(y + " " + rack.max.y)
				// 	if (x <= rack.max.y) {
				// 		rack.x = x;
				// 		rack.y = y;
				// 	}
				// }
			}
			await this.setMinimumDto();
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

const delay = (time: number) =>
	new Promise((resolve) => setTimeout(resolve, time));
