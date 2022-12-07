import Game from 'src/game2.0/Game';

export class MatchDto {
	lobby_name: string;
	players: string[];
	nbr_players: number;
	nbr_balls: number;
	owner: string;
	start: boolean;
	img: string;
	ranking: string[];
	started: boolean;
	public constructor(game: Game) {
		this.lobby_name = game.lobby_name;
		this.nbr_players = game.nbrPlayer;
		this.players = [];
		for (const player of game.players) this.players.push(player.login);
		this.nbr_balls = game.nbrBall;
		this.owner = game.owner;
		this.start = game.start;
		this.img = game.img;
		this.ranking = [];
		this.started = false;
	}
}

export default MatchDto;
