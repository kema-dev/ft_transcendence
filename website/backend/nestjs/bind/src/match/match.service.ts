import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { MatchEntity } from './match.entity';
import { MatchDto } from './objects/match.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class MatchService {
	constructor(
		@InjectRepository(MatchEntity)
		private matchRepository: Repository<MatchEntity>,
		private usersService: UsersService,
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
		console.log('createMatch: User flushed, creating match: ', match);
		const newMatch = await this.matchRepository.create(match);
		await this.matchRepository.save(newMatch);
		console.log('createMatch: Match created successfully, returning ✔');
		return newMatch;
	}

	async get_match(name: string) {
		console.log('getMatch: Starting');
		const match = await this.matchRepository.findOne({
			where: { lobby_name: name },
		});
		if (!match) {
			// throw new HttpException('Match not found', HttpStatus.NOT_FOUND);
			console.log('getMatch: Match not found, , returning ✘');
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
			// throw new HttpException('Match not found', HttpStatus.NOT_FOUND);
			console.log('startMatch: Match not found, , returning ✘');
			return false;
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

	async join_lobby(user: string, lobby: string, client: Socket) {
		console.log('joinLobby: Starting for user ' + user + ' in lobby ' + lobby);
		const match = await this.matchRepository.findOne({
			where: { lobby_name: lobby },
		});
		console.log('new match: ', match);
		if (!match) {
			console.log('Match not found');
		} else if (match.players.length >= 7) {
			console.log('Match full');
		} else if (match.players.includes(user)) {
			console.log('User already in lobby');
		}
		await this.flush_user_lobby(user);
		match.players.push(user);
		// console.log('match: ', match);
		await this.matchRepository.save(match);
		for (let i = 0; i < match.players.length; i++) {
			const usr = await this.usersService.getByAny(match.players[i]);
			// console.log('usr: ', usr.login);
			client.to(usr.socketId).emit('player_update', match.players);
			console.log('joinLobby: Player ' + usr.login + ' update sent');
		}
		console.log('joinLobby: Match joined, returning ✔');
		return match;
	}
}
