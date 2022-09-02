import { Injectable } from '@nestjs/common';
import Game from 'src/game2.0/Game';

@Injectable()
export class GameService {
	public games: Array<Game>;
}
