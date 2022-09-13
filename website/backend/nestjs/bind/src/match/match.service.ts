import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchEntity } from './match.entity';

@Injectable()
export class MatchService {
	constructor(
		@InjectRepository(MatchEntity)
		private matchRepository: Repository<MatchEntity>,
	) {}
}
