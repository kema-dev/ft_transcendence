export default class ProfileDto {
	x: number;
	y: number;
	rotation: number;
	login: string;
	score: number;
	red: boolean;
	constructor() {
		this.x = 0;
		this.y = 0;
		this.rotation = 0;
		this.login = 'search...';
		this.score = 10;
		this.red = false;
	}
}
