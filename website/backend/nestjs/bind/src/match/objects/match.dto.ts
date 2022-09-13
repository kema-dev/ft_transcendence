export class MatchDto {
	public constructor(params: Partial<MatchDto>) {
		this.nbrPlayer = 2;
		this.nbrBall = 1;
		this.players = [];
		this.start = false;
		this.lobby_name = '';
		Object.assign(this, params);
	}
	nbrPlayer: number;
	nbrBall: number;
	players: Array<string>;
	start: boolean;
	lobby_name: string;
}

export default MatchDto;
