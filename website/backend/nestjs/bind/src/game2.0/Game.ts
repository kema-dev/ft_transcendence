import Field from './objects/Field';
import Ball from './objects/Ball';
import Wall from './objects/Wall';
import Racket from './objects/Racket';
import { Logger } from '@nestjs/common';
import { GameDto } from './dto/GameDto';
import { BallDto } from './dto/BallDto';
import { WallDto } from './dto/WallDto';
import { RacketDto } from './dto/RacketDto';
import Profile from './objects/Profile';
import { UserEntity } from 'src/users/user.entity';
import { MatchService } from '../match/match.service';
import { AppGateway } from 'src/app.gateway';

export default class Game {
	nbrPlayer: number;
	nbrBall: number;
	start: boolean;
	lobby_name: string;
	run: boolean;
	balls: Array<Ball>;
	walls: Wall[];
	objects: Array<any>;
	deltaTime: number;
	logger: Logger;
	dto: GameDto;
	rackets: Racket[];
	profiles: Profile[];
	players: UserEntity[];
	sockets: string[];
	socketsViewers: string[];
	owner: string;
	img: string;
	match_service: MatchService;
	app: AppGateway;
	fieldpoints: Array<{ x: number, y: number }>;
	constructor(
		nbrPlayer: number,
		nbrBall: number,
		private server: any,
		players: UserEntity[],
		lobby_name: string,
		owner: string,
		img: string,
		match_service: MatchService,
		app: any,
	) {
		this.match_service = match_service;
		this.start = false;
		this.lobby_name = lobby_name;
		this.run = true;
		this.nbrBall = nbrBall;
		this.nbrPlayer = nbrPlayer;
		this.app = app;
		this.balls = [];
		this.objects = [];
		this.deltaTime = 1;
		this.rackets = [];
		this.profiles = [];
		this.img = img;
		this.players = players;
		this.sockets = [];
		this.socketsViewers = [];
		this.owner = owner;
		this.fieldpoints = [];
		for (let player of this.players)
			this.sockets.push(player.socketId);
		this.logger = new Logger();
		this.dto = new GameDto(nbrPlayer, nbrBall);
		this.init();
		this.setDto();
		this.loop();
	}
	init() {
		const radius = 410;
		const field = new Field(this.nbrPlayer);
		for (let i = 0; i < this.nbrBall; ++i) {
			this.balls.push(new Ball(radius, radius));
		}
		this.walls = field.walls;
		const fieldPoints: Array<number> = [];
		this.walls.forEach((wall) => {
			fieldPoints.push(wall.x);
			fieldPoints.push(wall.y);
		});
		for (let i = 0; i < fieldPoints.length; i += 2) {
			this.fieldpoints.push({ x: fieldPoints[i], y: fieldPoints[i + 1] });
		}
		let i = 0;
		this.walls.forEach((wall) => {
			this.objects.push(wall);
			if (wall.side) {
				let tmp;
				if (this.players[i])
					tmp = new Profile(
						this.players[i].login,
						this.players[i].avatar,
						10 - this.nbrPlayer,
						wall,
					);
				else tmp = new Profile('search', '', 10 - this.nbrPlayer, wall);
				this.profiles.push(tmp);
				wall.profile = tmp;
				const tmp2 = wall.getRacket();
				this.objects.push(tmp2);
				this.rackets.push(tmp2);
				i++;
			}
		});
	}
	setDto() {
		let i = 0;
		this.dto.start = this.start;
		this.dto.nbrBall = this.balls.length;
		for (i = 0; i < this.balls.length; ++i) {
			if (!this.dto.balls[i]) this.dto.balls[i] = new BallDto();
			this.dto.balls[i].x = this.balls[i].x;
			this.dto.balls[i].y = this.balls[i].y;
		}
		i = 0;
		this.walls.forEach((wall) => {
			if (!this.dto.walls[i]) this.dto.walls[i] = new WallDto();
			this.dto.walls[i].x = wall.x;
			this.dto.walls[i].y = wall.y;
			this.dto.walls[i].w = wall.width;
			this.dto.walls[i].h = wall.height;
			this.dto.walls[i].rotation = wall.angle;
			++i;
		});
		for (const i in this.rackets) {
			if (!this.dto.rackets[i]) this.dto.rackets[i] = new RacketDto();
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
		for (const i in this.rackets) {
			this.dto.rackets[i].x = this.rackets[i].x;
			this.dto.rackets[i].y = this.rackets[i].y;
		}
		this.dto.profiles = this.profiles;
	}
	setMov(value: number, login: string) {
		for (const p of this.profiles) {
			if (p.login == login) {
				p.mov = ((value * this.walls[0].height) / 100) * this.rackets[0].speed;
				return;
			}
		}
	}
	updateBalls(nbrBall: number) {
		const radius = 410;
		if (nbrBall > this.balls.length)
			this.balls.push(new Ball(radius, radius));
		else
			this.balls.pop();
		this.nbrBall = nbrBall;
		this.setDto();
	}
	getScores() {
		let scores = [];
		for (let p of this.profiles) scores.push(p.score);
		return scores;
	}
	addViewer(socketId: string) {
		this.sockets.push(socketId);
		this.socketsViewers.push(socketId);
	}
	isEnd() {
		return !this.run;
	}
	destructor() {
		this.run = false;
	}
	async loop() {
		let start = await performance.now();
		while (this.run) {
			if (this.start)
				for (const ball of this.balls) {
					let login: any;
					if ((login = ball.detectCollision(this.objects))) {
						this.run = false;
						if (this.nbrPlayer == 1) {
							this.match_service.add_match(this);
							this.server.to(this.players[0].socketId).emit('end', { win: true });
						}
						else if (this.nbrPlayer == 2) {
							this.match_service.add_match(this);
							this.server.to(this.players.find((p) => p.login != login)?.socketId).emit('end', { win: true });
							this.server.to(this.players.find((p) => p.login == login)?.socketId).emit('end', { win: false });
						}
						else
							this.server.to(this.players.find((p) => p.login == login)?.socketId).emit('end', { win: false });
						this.app.leftGame({ login: login, lose: true });
						return;
					}
					ball.x = ball.x + ball.v.x * ball.speed * this.deltaTime;
					ball.y = ball.y + ball.v.y * ball.speed * this.deltaTime;
				}
			for (const i in this.profiles) {
				const mov = this.profiles[i].mov;
				if (mov == 0) continue;
				const rack = this.rackets[i];
				const x = rack.x + -rack.vector.y * (this.deltaTime * mov);
				const y = rack.y + rack.vector.x * (this.deltaTime * mov);

				const rack_number = parseInt(i);
				const left_point = this.fieldpoints[rack_number * 2];
				let right_point;
				if (rack_number - 1 < 0) {
					right_point = this.fieldpoints[this.fieldpoints.length - 1];
				} else {
					right_point = this.fieldpoints[rack_number * 2 - 1];
				}

				const rack_offset = {
					x: rack.startX - left_point.x,
					y: rack.startY - left_point.y,
				};
				const left_with_offset = {
					x: left_point.x + rack_offset.x,
					y: left_point.y + rack_offset.y,
				};
				const right_with_offset = {
					x: right_point.x + rack_offset.x,
					y: right_point.y + rack_offset.y,
				};
				const rack_size = {
					x: rack.height * Math.sin(((rack.angle * -1) / 360) * 2 * Math.PI),
					y: rack.height * Math.cos(((rack.angle * -1) / 360) * 2 * Math.PI),
				};
				const rack_start = {
					x: x,
					y: y,
				};
				const rack_end = {
					x: x + rack_size.x,
					y: y + rack_size.y,
				};
				let move = false;
				if (
					this.point_between(rack_start, left_with_offset, right_with_offset) &&
					this.point_between(rack_end, left_with_offset, right_with_offset)
				) {
					move = true;
				}

				if (move == true) {
					rack.x = x;
					rack.y = y;
				} else {
				}
			}

			await this.setMinimumDto();
			this.server.to(this.sockets).emit('update_game', JSON.stringify(this.dto));
			const end = await performance.now();
			this.deltaTime = end - start;
			this.deltaTime /= 1000;
			this.deltaTime *= 60;
			start = end;
			await delay(1);
		}
	}
	point_between(point: any, left: any, right: any) {
		const x_min = Math.min(left.x, right.x);
		const x_max = Math.max(left.x, right.x);
		const y_min = Math.min(left.y, right.y);
		const y_max = Math.max(left.y, right.y);
		const delta = 0.5;
		if (
			point.x >= x_min - delta &&
			point.x <= x_max + delta &&
			point.y >= y_min - delta &&
			point.y <= y_max + delta
		) {
			return true;
		}
		return false;
	}
}

const delay = (time: number) =>
	new Promise((resolve) => setTimeout(resolve, time));
