import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchEntity } from './match.entity';
import { MatchDto } from './objects/match.dto';

@Injectable()
export class MatchService {
	constructor(
		@InjectRepository(MatchEntity)
		private matchRepository: Repository<MatchEntity>,
	) {}

	async create_match(match: MatchDto) {
		console.log('createMatch: Starting');
		const newMatch = await this.matchRepository.create(match);
		await this.matchRepository.save(newMatch);
		console.log('createMatch: Match created succssfuly, returning ✔');
		return newMatch;
	}

	async get_match(name: string) {
		console.log('getMatch: Starting');
		const match = await this.matchRepository.findOne({
			where: { lobby_name: name },
		});
		if (!match) {
			throw new HttpException('Match not found', HttpStatus.NOT_FOUND);
		}
		console.log('getMatch: Match found, returning ✔');
		return match;
	}

	async start_match(name: string) {
		console.log('startMatch: Starting');
		const match = await this.matchRepository.findOne({
			where: { lobby_name: name },
		});
		if (!match) {
			throw new HttpException('Match not found', HttpStatus.NOT_FOUND);
		}
		match.start = true;
		await this.matchRepository.save(match);
		console.log('startMatch: Match started, returning ✔');
		return match;
	}
}
