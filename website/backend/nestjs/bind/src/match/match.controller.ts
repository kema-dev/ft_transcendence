import {
	Body,
	Req,
	Res,
	Controller,
	HttpCode,
	Post,
	Get,
	UseGuards,
	Param,
	HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '../authentication/auth.guard';
import { MatchService } from './match.service';

@Controller('match')
export class MatchController {
	constructor(private readonly matchService: MatchService) {}

	@UseGuards(AuthGuard)
	@Post()
	async createMatch(@Body() MatchParams: MatchDto) {
		return await this.matchService.createMatch(MatchParams);
	}
}
