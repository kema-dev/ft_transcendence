export class MatchDto {
	public constructor(user: any) {
		this.lobby_name = '';
		this.players = [];
		this.nbr_players = 0;
		this.nbr_balls = 0;
	}
	lobby_name: string;
	players: string[];
	nbr_players: number;
	nbr_balls: number;
}

export default MatchDto;
