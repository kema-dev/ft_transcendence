import {
	Body,
	Req,
	Res,
	Controller,
	HttpCode,
	Post,
	UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';

@Controller('auth')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	// @UseGuards(JwtAuthenticationGuard) FIXME
	@Post('getlog')
	async getRank(login: string) {
		return this.usersService.getRank(login);
	}
}
