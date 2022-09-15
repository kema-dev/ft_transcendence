/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { AuthGuard } from '../authentication/auth.guard';
import { get } from 'http';
import { BasicUserDto } from '../chat/dto/BasicUserDto';
import UserDto from './dto/user.dto';

import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@UseGuards(AuthGuard)
	@Get('getBasicUser/:login')
	async getBasicUser(@Param() params: { login: string }) {
		const user = await this.usersService.getByLogin(params.login);
		return new BasicUserDto(user.login);
	}

	// @UseGuards(JwtAuthenticationGuard) FIXME
	@Post('getUser')
	async getUser(@Body() params: any) {
		return this.usersService.getByLogin(params.login);
	}
	// @Post('getAnyByLogin')
	// async getAnyByLogin(@Body() params: any) {
	// 	return this.usersService.getAnyByLogin(params.login, params.infos);
	// }
}
