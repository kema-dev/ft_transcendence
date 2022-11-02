import ProfileDto from './ProfileDto';
import { RacketDto } from './RacketDto';
import { BallDto } from './BallDto';
import { WallDto } from './WallDto';
import Game from 'src/game2.0/Game';

export class GameDto {
	nbrPlayer: number;
	nbrBall: number;
	start: boolean;
	balls: Array<BallDto>;
	walls: Array<WallDto>;
	rackets: RacketDto[];
	profiles: ProfileDto[];
	constructor(game: Game) {
		this.start = false;
		this.nbrBall = game.nbrBall;
		this.nbrPlayer = game.nbrPlayer;
		this.balls = [];
		this.walls = [];
		this.rackets = [];
		this.profiles = [];
		let i = 0;
		this.start = game.start;
		this.nbrBall = game.balls.length;
		for (i = 0; i < game.balls.length; ++i) {
			if (!this.balls[i]) this.balls[i] = new BallDto();
			this.balls[i].x = game.balls[i].x;
			this.balls[i].y = game.balls[i].y;
		}
		i = 0;
		game.walls.forEach((wall) => {
			if (!this.walls[i]) this.walls[i] = new WallDto();
			this.walls[i].x = wall.x;
			this.walls[i].y = wall.y;
			this.walls[i].w = wall.width;
			this.walls[i].h = wall.height;
			this.walls[i].rotation = wall.angle;
			++i;
		});
		for (const i in this.rackets) {
			if (!this.rackets[i]) this.rackets[i] = new RacketDto(); 
			this.rackets[i].x = game.rackets[i].x;
			this.rackets[i].y = game.rackets[i].y;
			this.rackets[i].rotation = game.rackets[i].angle;
			this.rackets[i].h = game.rackets[i].height;
			this.rackets[i].w = game.rackets[i].width;
		}
		this.profiles = this.profiles;
	}
}
