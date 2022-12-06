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
import { SmallGameDto } from 'src/game2.0/dto/SmallGameDto';

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
	smallDto: SmallGameDto;
	rackets: Racket[];
	profiles: Profile[];
	players: UserEntity[];
	sockets: string[];
	socketsViewers: string[];
	owner: string;
	img: string;
	startTime: number;
	match_service: MatchService;
	app: AppGateway;
	fieldpoints: Array<{ x: number; y: number }>;
	interval: any;
	maxDelta: number;
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
		this.deltaTime = 0.175;
		this.rackets = [];
		this.profiles = [];
		this.maxDelta = 0;
		this.img = img;
		this.players = players;
		this.sockets = [];
		this.socketsViewers = [];
		this.owner = owner;
		this.fieldpoints = [];
		for (const player of this.players) this.sockets.push(player.socketId);
		this.logger = new Logger();
		this.init();
		this.update();
		this.startTime = Date.now();
		this.interval = setInterval(this.loop, 1000 / 90, this);
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
			this.objects.push(wall);
		});
	}
	async loop(game: Game) {
		let time = 0;
		const timeBalls = [];
		const timeStart = Date.now();
		game.setSmallDto();
		if (game.start) {
			for (const ball of game.balls) {
				timeBalls.push(game.movBall(game, ball));
			}
		}
		for (const i in game.profiles) {
			const mov = game.profiles[i].mov;
			if (mov == 0) continue;
			game.movRacket(game, i, mov);
		}
		game.server.to(game.sockets).emit('update_game', game.smallDto);
		const endTime = Date.now();
		time = Date.now() - timeStart;
		game.deltaTime = endTime - game.startTime;
		if (game.deltaTime > game.maxDelta && game.start) {
			game.maxDelta = game.deltaTime;
			console.log(game.deltaTime, time, timeBalls);
		}
		game.startTime = endTime;
	}
	async movBall(game: Game, ball: Ball) {
		const timeStart = performance.now();
		if (ball.speed == 0) return;
		let login: any;
		if ((login = ball.detectCollision(game.objects))) {
			game.run = false;
			if (game.nbrPlayer == 1) {
				// game.match_service.add_ranking(game.id, login);
				game.server.to(game.players[0].socketId).emit('end', { win: true });
			} else if (game.nbrPlayer == 2) {
				// game.match_service.add_ranking(game.id, login);
				// game.match_service.add_ranking(
				// 	game.id,
				// 	game.players.find((p) => p.login != login).login,
				// );
				game.server
					.to(game.players.find((p) => p.login != login)?.socketId)
					.emit('end', { win: true });
				game.server
					.to(game.players.find((p) => p.login == login)?.socketId)
					.emit('end', { win: false });
			} else {
				// game.match_service.add_ranking(game.id, login);
				game.server
					.to(game.players.find((p) => p.login == login)?.socketId)
					.emit('end', { win: false });
			}
			game.app.quitGame(login, { lose: true });
			game.destructor();
			return;
		}
		ball.x = ball.x + ball.v.x * ball.speed * game.deltaTime;
		ball.y = ball.y + ball.v.y * ball.speed * game.deltaTime;
		return Number(performance.now() - timeStart).toFixed(3);
	}
	setDto() {
		this.dto = new GameDto(this);
	}
	async setSmallDto() {
		this.smallDto = new SmallGameDto(this);
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
		if (nbrBall > this.balls.length) this.balls.push(new Ball(radius, radius));
		else this.balls.pop();
		this.nbrBall = nbrBall;
		this.update();
	}
	getScores() {
		const scores = [];
		for (const p of this.profiles) scores.push(p.score);
		return scores;
	}
	addViewer(socketId: string) {
		if (this.sockets.find((s) => s == socketId) == undefined) {
			this.sockets.push(socketId);
			this.socketsViewers.push(socketId);
		}
	}
	isEnd() {
		return !this.run;
	}
	update() {
		this.setDto();
		this.server.to(this.sockets).emit('init_game', this.dto);
	}
	destructor() {
		this.run = false;
		clearInterval(this.interval);
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
	async movRacket(game: Game, i: string, mov: number) {
		const rack = game.rackets[parseInt(i)];
		const x = rack.x + -rack.vector.y * (game.deltaTime * mov);
		const y = rack.y + rack.vector.x * (game.deltaTime * mov);

		const rack_number = parseInt(i);
		const left_point = game.fieldpoints[rack_number * 2];
		let right_point;
		if (rack_number - 1 < 0) {
			right_point = game.fieldpoints[game.fieldpoints.length - 1];
		} else {
			right_point = game.fieldpoints[rack_number * 2 - 1];
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
			game.point_between(rack_start, left_with_offset, right_with_offset) &&
			game.point_between(rack_end, left_with_offset, right_with_offset)
		) {
			move = true;
		}
		if (move == true) {
			rack.x = x;
			rack.y = y;
		}
	}
}

const delay = (time: number) =>
	new Promise((resolve) => setTimeout(resolve, time));
