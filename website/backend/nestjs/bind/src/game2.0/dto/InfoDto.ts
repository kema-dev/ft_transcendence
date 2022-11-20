import Game from 'src/game2.0/Game';

export interface InfoDto {
	owner: string | undefined;
	isStart: boolean | undefined;
	isWin: boolean | undefined;
	isLose: boolean | undefined;
	remount: boolean | undefined;
	left: string | undefined;
	nbrBall: number | undefined;
}

// export class InfoDto {
// 	owner: string;
// 	isStart: boolean;
// 	isWin: boolean;
// 	isLose: boolean;
// 	remount: boolean;
// 	left: string;
// 	constructor(game: Game, info?: {remount?: boolean, isWin?: boolean, left?: string}) {
// 		this.owner = game.owner;
// 		this.isStart = game.start;
// 		this.isWin = false;
// 		this.remount = remount;
// 		this.left = '';
// 	}
// }
