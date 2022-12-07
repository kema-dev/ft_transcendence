/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	Body,
	Controller,
	HttpCode,
	Post,
	Get,
	UseGuards,
	Param,
} from '@nestjs/common';
import { stat } from 'fs';
import { AuthGuard } from '../authentication/auth.guard';
import { MatchService } from './match.service';

@Controller('match')
export class MatchController {
	constructor(private matchService: MatchService) {}

	// @Get('simulate')
	// async simulate() {
	// 	this.matchService.simulate_5_matches();
	// }

	@UseGuards(AuthGuard)
	@Post('get_user_ratio')
	async get_ratio(@Body() body: any) {
		console.log('get_user_ratio: Starting');
		const stats = await this.matchService.get_user_stats(body.login);
		console.log('get_user_ratio: Returning');
		return stats.average_rank;
	}

	@UseGuards(AuthGuard)
	@Post('get_user_history')
	async get_history(@Body() body: any) {
		console.log('get_user_history: Starting');
		const matches = await this.matchService.get_user_matches(body.login);
		console.log('get_user_history: Returning');
		return matches;
	}

	@UseGuards(AuthGuard)
	@Post('get_user_stats')
	async get_user_stats(@Body() body: any) {
		console.log('get_stats: Starting');
		const matches = await this.matchService.get_user_stats(body.login);
		console.log('get_stats: Returning');
		return matches;
	}
}
