export class MatchDto {
	public constructor(game: any) {
		this.lobby_name = game.lobby_name;
		this.nbr_players = game.nbrPlayer;
		this.players = [];
		for (let player of game.players)
			this.players.push(player.login);
		this.nbr_balls = game.nbrBall;
		this.owner = game.owner;
		this.start = game.start;
		this.img = game.img;
	}
	lobby_name: string;
	players: string[];
	nbr_players: number;
	nbr_balls: number;
	owner: string;
	start: boolean;
	img: string;
}

export default MatchDto;
