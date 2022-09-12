import Wall from '../objects/Wall';

export default class Profile {
	x: number;
	y: number;
	rotation: number;
	login: string;
	score: number;
	red: boolean;
	mov: number;
	constructor(login: string, score: number, wall: Wall) {
		this.x = wall.x;
		this.y = wall.y;
		this.x -= wall.vector.x * 55;
		this.y -= wall.vector.y * 60;
		this.y += (wall.vector.x * wall.height) / 2;
		this.x -= (wall.vector.y * wall.height) / 2;
		this.mov = 0;
		this.rotation = 0;
		this.red = false;
		if (login) this.login = login;
		else this.login = 'search...';
		this.score = score;
	}
}
