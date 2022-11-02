export class InfoDto {
	isOwner: boolean;
	isStart: boolean;
	isWin: boolean;
	isLose: boolean;
	remount: boolean;
	left: string;
	constructor(isOwner: boolean, isStart: boolean, isWin: boolean, isLose: boolean, remount: boolean, left: string) {
		this.isOwner = isOwner;
		this.isStart = isStart;
		this.isWin = isWin;
		this.isLose = isLose;
		this.remount = remount;
		this.left = left;
	}
}
