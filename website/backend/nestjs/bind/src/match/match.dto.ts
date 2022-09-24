export class MatchDto {
	public constructor(
		_lobby_name: string,
		_players: string[],
		_nbr_players: number,
		_nbr_balls: number,
		_owner: string,
		_start: boolean,
	) {
		this.lobby_name = _lobby_name;
		this.players = _players;
		this.nbr_players = _nbr_players;
		this.nbr_balls = _nbr_balls;
		this.owner = _owner;
		this.start = _start;
	}
	lobby_name: string;
	players: string[];
	nbr_players: number;
	nbr_balls: number;
	owner: string;
	start: boolean;
}

export default MatchDto;
