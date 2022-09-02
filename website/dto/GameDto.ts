import {BallDto} from './BallDto';
import {WallDto} from './WallDto';

export class GameDto {
	nbrPlayer: number;
	nbrBall: number;
	start: boolean;
	balls: Array<BallDto>;
	walls: Array<WallDto>;
	// rackets: Array<RacketsDto
	constructor(nbrPlayer: number, nbrBall: number) {
		this.start = false;
		this.nbrBall = nbrBall;
		this.nbrPlayer = nbrPlayer;
		this.balls = [];
		this.walls = [];
	}
}
