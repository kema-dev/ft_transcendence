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
import { MatchDto } from './objects/match.dto';

@Controller('match')
export class MatchController {
	constructor(private readonly matchService: MatchService) {}
}
