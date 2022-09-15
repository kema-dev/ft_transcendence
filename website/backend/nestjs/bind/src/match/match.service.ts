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

	async flush_user_lobby(user: string) {
		console.log('flushUserLobby: Starting');
		const match = await this.matchRepository.find({
			where: { owner: user },
		});
		for (let i = 0; i < match.length; i++) {
			await this.matchRepository.remove(match[i]);
		}
		console.log('flushUserLobby: Match flushed, returning ✔');
		return true;
	}

	async create_match(match: MatchDto) {
		console.log('createMatch: Starting');
		await this.flush_user_lobby(match.owner);
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

	async get_lobby_list() {
		console.log('getLobbyList: Starting');
		const match = await this.matchRepository.find({
			where: { open: true },
		});
		if (!match) {
			throw new HttpException('Match not found', HttpStatus.NOT_FOUND);
		}
		console.log('getLobbyList: Match found, returning ✔');
		return match;
	}

	async join_lobby(user: string, lobby: string) {
		console.log('joinLobby: Starting for user ' + user + ' in lobby ' + lobby);
		const match = await this.matchRepository.findOne({
			where: { lobby_name: lobby },
		});
		if (!match) {
			throw new HttpException('Match not found', HttpStatus.NOT_FOUND);
		} else if (match.players.length >= 7) {
			throw new HttpException('Match full', HttpStatus.NOT_FOUND);
		} else if (match.players.includes(user)) {
			throw new HttpException('User already in lobby', HttpStatus.NOT_FOUND);
		}
		match.players.push(user);
		await this.matchRepository.save(match);
		console.log('joinLobby: Match joined, returning ✔');
		return match;
	}
}
