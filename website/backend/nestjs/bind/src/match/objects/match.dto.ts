export class MatchDto {
	public constructor(params: Partial<MatchDto>) {
		this.nbrPlayer = 2;
		this.nbrBall = 1;
		this.players = [];
		this.start = false;
		this.lobby_name = '';
		this.open = true;
		Object.assign(this, params);
	}
	nbrPlayer: number;
	nbrBall: number;
	players: Array<string>;
	start: boolean;
	lobby_name: string;
	open: boolean;
}

export default MatchDto;
