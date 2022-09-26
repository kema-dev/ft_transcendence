import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Game from '../game2.0/Game';
import { UsersService } from '../users/users.service';
import { MatchEntity } from './match.entity';

// NOTE - API's documentation can be found at `docs/api/v1.md`

@Injectable()
export class MatchService {
	constructor(
		@InjectRepository(MatchEntity)
		private matchRepository: Repository<MatchEntity>,
		private usersService: UsersService,
	) {}

	async debug() {
		await this.matchRepository.save({
			player_count: 1,
			ball_count: 2,
			lobby_name: 'game.lobby_name',
			owner: 'game.owner',
			players: ['1', '2'],
			scores: [1, 2],
		});
		console.log(test);
	}

	async add_match(game: Game) {
		const scores = [];
		for (const player of game.profiles) {
			scores.push(player.score);
		}
		const ranks = [];
		for (let i = 0; i < scores.length; i++) {
			ranks.push(0);
			for (let j = 0; j < scores.length; j++) {
				if (scores[i] > scores[j]) {
					ranks[i]++;
				}
			}
		}
		const match = await this.matchRepository.create({
			player_count: game.nbrPlayer,
			ball_count: game.nbrBall,
			lobby_name: game.lobby_name,
			owner: game.owner,
			players: game.profiles.map((profile) => profile.login),
			scores: game.profiles.map((profile) => profile.score),
			ranks: ranks,
		});
		for (const profile of game.profiles) {
			this.assign_match_to_user(profile.login, match.id);
		}
	}

	assign_match_to_user(login: string, match_id: number) {
		this.usersService.assign_match_to_user(login, match_id);
	}

	async get_match(id: number) {
		const match = await this.matchRepository.findOne({
			where: { id: id },
		});
		if (!match) {
			return null;
		}
		return match;
	}

	async get_user_matches(login: string) {
		const usr = await this.usersService.getByAny(login);
		if (!usr) {
			return null;
		}
		const matches = [];
		for (const match_id of usr.match) {
			const match = await this.get_match(match_id);
			if (match) {
				matches.push(match);
			}
		}
		return matches;
	}

	async get_user_stats(login: string) {
		const matches = await this.get_user_matches(login);
		if (!matches) {
			return null;
		}
		const stats = {
			total: matches.length,
			wins: 0,
			loses: 0,
			average_rank: 0,
		};
		for (const match of matches) {
			const index = match.players.indexOf(login);
			if (match.scores[index] == 0) {
				stats.loses += 1;
			} else {
				stats.wins += 1;
			}
			stats.average_rank += match.ranks[index] / match.player_count;
		}
		return stats;
	}
}
