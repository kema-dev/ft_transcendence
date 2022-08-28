import Wall from "./Wall";

export default class Profile {
	x: number;
	y: number;
	angle: number;
	nbrPlayer: number;

	constructor(wall: Wall, nbrPlayer: number) {
		this.x = wall.x;
		this.y = wall.y;
		this.x -= wall.vector.x * 55;
		this.y -= wall.vector.y * 60;
		this.y += (wall.vector.x * wall.width) / 2;
		this.x -= (wall.vector.y * wall.width) / 2;
		this.angle = wall.angle;
		this.nbrPlayer = nbrPlayer;
	}
}
