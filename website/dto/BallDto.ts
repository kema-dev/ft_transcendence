import {VectorDto} from './VectorDto';

export class BallDto {
	x: number;
	y: number;
	v: VectorDto;
	constructor() {
		this.x = 0;
		this.y = 0;
		this.v = new VectorDto(0, 0);
	}
}
