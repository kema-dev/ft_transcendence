import ProfileDto from './ProfileDto';
import { RacketDto } from './RacketDto';
import { BallDto } from './BallDto';
import { WallDto } from './WallDto';

export class GameDto {
	nbrPlayer: number;
	nbrBall: number;
	start: boolean;
	balls: Array<BallDto>;
	walls: Array<WallDto>;
	rackets: RacketDto[];
	profiles: ProfileDto[];
	constructor(nbrPlayer: number, nbrBall: number) {
		this.start = false;
		this.nbrBall = nbrBall;
		this.nbrPlayer = nbrPlayer;
		this.balls = [];
		this.walls = [];
		this.rackets = [];
		this.profiles = [];
	}
	clone(): GameDto {
		const rs = new GameDto(this.nbrPlayer, this.nbrBall);
		rs.start = this.start;
		rs.balls = this.balls.map((x) => Object.assign({}, x));
		rs.walls = this.walls.map((x) => Object.assign({}, x));
		return rs;
	}
}
