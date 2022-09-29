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
	owner: string;
	img: string;
	match_service: MatchService;
	fieldpoints: Array<{ x: number, y: number}>;
	constructor(
		nbrPlayer: number,
		nbrBall: number,
		private server: any,
		players: UserEntity[],
		lobby_name: string,
		owner: string,
		img: string,
		match_service: MatchService,
	) {
		this.match_service = match_service;
		this.start = false;
		this.lobby_name = lobby_name;
		this.run = true;
		this.nbrBall = nbrBall;
		this.nbrPlayer = nbrPlayer;
		this.balls = [];
		this.objects = [];
		this.deltaTime = 1;
		this.rackets = [];
		this.profiles = [];
		this.img = img;
		this.players = players;
		this.sockets = [];
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
				console.log('racket');
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
		// this.dto.owner = this.owner;
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
			this.logger.log(p.login);
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
					if (ball.detectCollision(this.objects)) {
						this.run = false;
						this.match_service.add_match(this);
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
				// this.logger.log(rack.vector.y)
				// this.logger.log(rack.angle)
				// this.logger.log("x: " + x)
				// this.logger.log("y: " + y)
				// this.logger.log("vx: " + rack.vector.x)
				// this.logger.log("vy: " + rack.vector.y)
				// this.logger.log("res: " + rack.vector.y * rack.startX)
				// this.logger.log("res2: " + (rack.vector.y * rack.startX + rack.vector.y * rack.height * 3))
				// this.logger.log("res3: " + rack.vector.x * rack.startY)
				// this.logger.log("res4: " + (rack.vector.x * rack.startY + rack.vector.x * rack.height * 3))
				// if (x >= rack.vector.y * rack.startX && x <= rack.vector.y * rack.startX + rack.vector.y * rack.height * 3 &&
				// 	y >= rack.vector.x * rack.startY && y <= rack.vector.x * rack.startY + rack.vector.x * rack.height * 3) {
				// console.log('rack start x: ' + rack.startX);
				// console.log('rack start y: ' + rack.startY);
				// console.log('field:', this.fieldpoints);
				console.log('field:', this.fieldpoints);
				const rack_number = parseInt(i);
				console.log('rack_number:', rack_number);
				const left_point = this.fieldpoints[rack_number];
				let right_point;
				if (rack_number - 1 < 0) {
					right_point = this.fieldpoints[this.fieldpoints.length - 1];
				} else {
					right_point = this.fieldpoints[rack_number - 1];
				}
				console.log('number:', (rack_number - 1) % (this.nbrPlayer * 2));
				console.log('left_point:', left_point);
				console.log('right_point:', right_point);
				const allowed_space_x = right_point.x - left_point.x;
				const allowed_space_y = right_point.y - left_point.y;
				console.log('allowed_space_x:', allowed_space_x);
				console.log('allowed_space_y:', allowed_space_y);
				console.log('rack.width:', rack.width);
				console.log('rack.height:', rack.height);
				console.log('rack angle:', rack.angle);
				const rack_space_y =
					rack.height * Math.cos((rack.angle / 360) * 2 * Math.PI);
				const rack_space_x =
					rack.height * Math.sin((rack.angle / 360) * 2 * Math.PI);
				console.log('rack_space_x:', rack_space_x);
				console.log('rack_space_y:', rack_space_y);
				const rack_min_x_tmp = rack.startX;
				const rack_min_y_tmp = rack.startY;
				const rack_max_x_tmp = rack.startX + allowed_space_x;
				const rack_max_y_tmp = rack.startY + allowed_space_y;
				const rack_min_x_ord = Math.min(rack_min_x_tmp, rack_max_x_tmp);
				const rack_min_y_ord = Math.min(rack_min_y_tmp, rack_max_y_tmp);
				const rack_max_x_ord = Math.max(rack_min_x_tmp, rack_max_x_tmp);
				const rack_max_y_ord = Math.max(rack_min_y_tmp, rack_max_y_tmp);
				const rack_min_x = rack_min_x_ord;
				const rack_min_y = rack_min_y_ord;
				const rack_max_x = rack_max_x_ord - rack_space_x;
				const rack_max_y = rack_max_y_ord - rack_space_y;
				console.log('rack_min_x:', rack_min_x);
				console.log('rack_max_x:', rack_max_x);
				console.log('rack_min_y:', rack_min_y);
				console.log('rack_max_y:', rack_max_y);
				console.log('x:', x);
				console.log('y:', y);
				const delta = 0.1;
				if (
					x >= rack_min_x - delta &&
					x <= rack_max_x + delta &&
					y >= rack_min_y - delta &&
					y <= rack_max_y + delta
				) {
					console.log('MOVE');
				} else {
					console.log('STAY');
				}
				rack.x = x;
				rack.y = y;
				// }
				// if (rack.angle < 90) {
				// 	if (y >= rack.max.x) {
				// 		rack.x = x;
				// 		rack.y = y;
				// 	}
				// }
				// else if (rack.angle < 180) {
				// 	if (x >= rack.max.y && x <= rack.max.x) {
				// 		rack.x = x;
				// 		rack.y = y;
				// 	}
				// }
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
}

const delay = (time: number) =>
	new Promise((resolve) => setTimeout(resolve, time));
