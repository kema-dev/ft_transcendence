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
} from '@nestjs/common';
import UserDto from 'src/users/dto/user.dto';

import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	// @UseGuards(JwtAuthenticationGuard)
	@Get('getRank')
	async getRank(login: string) {
		return this.usersService.getRank(login);
	}
}
