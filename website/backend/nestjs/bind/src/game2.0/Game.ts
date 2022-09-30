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

				// console.log('field:', this.fieldpoints);
				const rack_number = parseInt(i);
				// console.log('rack_number:', rack_number);
				const left_point = this.fieldpoints[rack_number * 2];
				let right_point;
				if (rack_number - 1 < 0) {
					right_point = this.fieldpoints[this.fieldpoints.length - 1];
				} else {
					right_point = this.fieldpoints[rack_number * 2 - 1];
				}
				// console.log('number:', (rack_number - 1) % (this.nbrPlayer * 2));
				// console.log('left_point:', left_point);
				// console.log('right_point:', right_point);
				const x_min = Math.min(left_point.x, right_point.x);
				const x_max = Math.max(left_point.x, right_point.x);
				const y_min = Math.min(left_point.y, right_point.y);
				const y_max = Math.max(left_point.y, right_point.y);
				console.log('x_min:', x_min);
				console.log('x_max:', x_max);
				console.log('y_min:', y_min);
				console.log('y_max:', y_max);
				const rack_offset_x = rack.startX - left_point.x;
				const rack_offset_y = rack.startY - left_point.y;
				console.log('rack_offset_x:', rack_offset_x);
				console.log('rack_offset_y:', rack_offset_y);
				const rack_space_y =
					rack.height * Math.cos((rack.angle / 360) * 2 * Math.PI);
				const rack_space_x =
					rack.height * Math.sin((rack.angle / 360) * 2 * Math.PI);
				console.log('rack_space_x:', rack_space_x);
				console.log('rack_space_y:', rack_space_y);
				let min_rack_x;
				let max_rack_x;
				let min_rack_y;
				let max_rack_y;
				if (rack_space_x > 0) {
					min_rack_x = x_min + rack_offset_x;
					max_rack_x = x_max + rack_offset_x - rack_space_x;
				} else {
					min_rack_x = x_min + rack_offset_x + rack_space_x;
					max_rack_x = x_max + rack_offset_x;
				}
				if (rack_space_y > 0) {
					min_rack_y = y_min + rack_offset_y;
					max_rack_y = y_max + rack_offset_y - rack_space_y;
				} else {
					min_rack_y = y_min + rack_offset_y + rack_space_y;
					max_rack_y = y_max + rack_offset_y;
				}
				console.log('min_rack_x:', min_rack_x);
				console.log('max_rack_x:', max_rack_x);
				console.log('min_rack_y:', min_rack_y);
				console.log('max_rack_y:', max_rack_y);
				// const allowed_space_x = x_max - x_min + rack_offset_x;
				// const allowed_space_y = y_max - y_min + rack_offset_y;
				// console.log('allowed_space_x:', allowed_space_x);
				// console.log('allowed_space_y:', allowed_space_y);
				// console.log('rack.width:', rack.width);
				// console.log('rack.height:', rack.height);
				// console.log('rack angle:', rack.angle);
				// const rack_x_1 = rack.startX;
				// const rack_x_2 = rack.startX + rack_space_x;
				// const rack_start_x = Math.min(rack_x_1, rack_x_2);
				// const rack_end_x = Math.max(rack_x_1, rack_x_2);
				// const rack_y_1 = rack.startY;
				// const rack_y_2 = rack.startY + rack_space_y;
				// const rack_start_y = Math.min(rack_y_1, rack_y_2);
				// const rack_end_y = Math.max(rack_y_1, rack_y_2);
				// const future_rack_start_x_1 = 9999;
				// const future_rack_start_x_2 = x + rack_space_x;
				// const future_rack_start_x = Math.min(
				// 	future_rack_start_x_1,
				// 	future_rack_start_x_2,
				// );
				// const future_rack_end_x = Math.max(
				// 	future_rack_start_x_1,
				// 	future_rack_start_x_2,
				// );
				// const future_rack_start_y_1 = 99999;
				// const future_rack_start_y_2 = y + rack_space_y;
				// const future_rack_start_y = Math.min(
				// 	future_rack_start_y_1,
				// 	future_rack_start_y_2,
				// );
				// const future_rack_end_y = Math.max(
				// 	future_rack_start_y_1,
				// 	future_rack_start_y_2,
				// );
				// console.log('future_rack_start_x:', future_rack_start_x);
				// console.log('future_rack_end_x:', future_rack_end_x);
				// console.log('future_rack_start_y:', future_rack_start_y);
				// console.log('future_rack_end_y:', future_rack_end_y);
				console.log('x:', x);
				console.log('y:', y);
				console.log('x + rack_space_x:', x + rack_space_x);
				console.log('y + rack_space_y:', y + rack_space_y);
				console.log('');
				let move = false;
				const delta = 0.5;
				if (
					x > min_rack_x - delta &&
					x < max_rack_x + delta &&
					y > min_rack_y - delta &&
					y < max_rack_y + delta
				) {
					move = true;
				} else {
					move = false;
				}

				if (move == true) {
					rack.x = x;
					rack.y = y;
					console.log('MOVE');
				} else {
					console.log('STAY');
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
}

const delay = (time: number) =>
	new Promise((resolve) => setTimeout(resolve, time));
