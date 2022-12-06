import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { identity } from 'rxjs';
import { Repository } from 'typeorm';
import Game from '../game2.0/Game';
import { UsersService } from '../users/users.service';
import { MatchEntity } from './match.entity';

@Injectable()
export class MatchService {
	constructor(
		@InjectRepository(MatchEntity)
		private matchRepository: Repository<MatchEntity>,
		private usersService: UsersService,
	) {}

	async debug() {
		console.log('        Debug: from MatchService');
	}

	async create_match(): Promise<number> {
		console.log('create_match: Starting');
		const match = await this.matchRepository.save({
			player_count: -1,
			ball_count: -1,
			lobby_name: '',
			owner: '',
			players: [],
			ranking: [],
		});
		return match.id;
	}

	async fill_match_infos(game: Game): Promise<number> {
		console.log('create_match: Starting');
		const game_players = game.profiles.map((profile) => profile.login);
		// for each player, use their email
		for (let i = 0; i < game_players.length; i++) {
			const usr = await this.usersService.getByAny(game_players[i]);
			if (usr) {
				game_players[i] = usr.email;
			}
		}
		const game_scores = game.profiles.map((profile) => profile.score);
		const ranking: string[] = [];
		const match = await this.matchRepository.save({
			player_count: game.nbrPlayer,
			ball_count: game.nbrBall,
			lobby_name: game.lobby_name,
			owner: game.owner,
			players: game_players,
			scores: game_scores,
			ranking: ranking,
		});
		return match.id;
	}

	async add_ranking(id: number, login: string) {
		const match = await this.matchRepository.findOne({
			where: { id: id },
		});
		match.ranking.push(login);
		await this.matchRepository.save(match);
		await this.assign_match_to_user(login, match.id);
		await this.usersService.set_status(login, 'online');
	}

	async assign_match_to_user(login: string, match_id: number) {
		// if (login == 'search') {
		// 	return;
		// }
		await this.usersService.assign_match_to_user(login, match_id);
	}

	async get_match(id: number) {
		console.log('get_match: Starting for id ' + id);
		const match = await this.matchRepository.findOne({
			where: { id: id },
		});
		if (!match) {
			return null;
		}
		console.log('get_match: Returning for id ' + id);
		return match;
	}

	async get_user_matches(login: string) {
		console.log('get_user_matches: Starting');
		const usr = await this.usersService.getByAny(login);
		if (!usr || !usr.match || usr.match == undefined) {
			return null;
		}
		console.log('get_user_matches: matches: ', usr.match);
		const matches = [];
		for (const match_id of usr.match) {
			const match = await this.get_match(match_id);
			if (match) {
				matches.push(match);
			}
		}
		// for each match, change the login to the email
		for (const match of matches) {
			for (let i = 0; i < match.players.length; i++) {
				const usr = await this.usersService.getByAny(match.players[i]);
				if (usr) {
					match.players[i] = usr.login;
				}
			}
		}
		matches.reverse();
		console.log('get_user_matches: Returning');
		return matches;
	}

	async get_user_stats(login: string) {
		console.log('get_user_stats: Starting');
		const level = await this.usersService.get_user_level(login);
		const matches = await this.get_user_matches(login);
		if (!matches) {
			return {
				total: 0,
				wins: 0,
				loses: 0,
				average_rank: 0.5,
				level: level,
			};
		}
		// console.log('     get_user_stats: matches: ');
		const stats = {
			total: matches.length,
			wins: 0,
			loses: 0,
			average_rank: 0,
			level: level,
		};
		for (const match of matches) {
			const index = match.ranking.reverse().indexOf(login);
			if (index == 0) {
				stats.wins += 1;
			} else {
				stats.loses += 1;
			}
			stats.average_rank += (index - 1) / (match.player_count - 1);
		}
		if (stats.total < 1) {
			stats.average_rank = 0.5;
		} else {
			stats.average_rank /= stats.total;
		}
		console.log('get_user_stats: Returning');
		return stats;
	}

	// async simulate_5_matches() {
	// 	for (let i = 0; i < 5; i++) {
	// 		const match = await this.matchRepository.create({
	// 			player_count: 2,
	// 			ball_count: 2,
	// 			lobby_name: 'lobby_name',
	// 			owner: 'owner',
	// 			players: ['q', 'w'],
	// 			ranking: ['q', 'w'],
	// 		});
	// 		for (const profile of match.players) {
	// 			this.assign_match_to_user(profile, match.id);
	// 		}
	// 	}
	// }
}
