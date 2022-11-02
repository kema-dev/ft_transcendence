import Game from 'src/game2.0/Game';

export class InfoDto {
	isOwner: boolean;
	isStart: boolean;
	isWin: boolean;
	isLose: boolean;
	remount: boolean;
	left: string;
	constructor(game: Game, client: string, remount: boolean, isWin?: boolean, left?: string) {
		this.isOwner = client == game.owner;
		this.isStart = game.start;
		this.isWin = isWin;
		this.remount = remount;
		this.left = left ? left : '';
	}
}
