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
import { AuthGuard } from '../authentication/auth.guard';
import { MatchService } from './match.service';

@Controller('match')
export class MatchController {
	constructor(private matchService: MatchService) {}
}
