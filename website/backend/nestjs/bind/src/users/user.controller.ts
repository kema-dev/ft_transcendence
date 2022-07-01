import {
	Body,
	Req,
	Res,
	Controller,
	HttpCode,
	Post,
	Get,
	UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	// @UseGuards(JwtAuthenticationGuard) FIXME
	@Get('getRank')
	async getRank() {
		return this.usersService.getRank();
	}
}
