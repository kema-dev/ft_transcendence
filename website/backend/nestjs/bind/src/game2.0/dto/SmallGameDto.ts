import { RacketDto } from './RacketDto';
import { BallDto } from './BallDto';
import Game from 'src/game2.0/Game';

export class SmallGameDto {
	start: boolean;
	balls: Array<BallDto>;
	rackets: RacketDto[];
	profiles: {
		score: number,
		red: boolean
	}[];
	constructor(game: Game) {
		this.start = game.start;
		this.balls = [];
		for (let i = 0; i < game.balls.length; ++i) {
			if (!this.balls[i]) this.balls[i] = new BallDto();
			this.balls[i].x = game.balls[i].x;
			this.balls[i].y = game.balls[i].y;
		}
		this.rackets = [];
		for (const i in game.rackets) {
			if (!this.rackets[i]) this.rackets[i] = new RacketDto();
			this.rackets[i].x = game.rackets[i].x;
			this.rackets[i].y = game.rackets[i].y;
		}
		this.profiles = [];
		for (const i in game.profiles) {
			this.profiles[i] = {
				score: game.profiles[i].score,
				red: game.profiles[i].red
			};
		}
	}
}
