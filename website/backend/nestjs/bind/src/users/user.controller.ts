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
	Logger,
} from '@nestjs/common';
import { AuthGuard } from '../authentication/auth.guard';
import ProfileUserDto from 'src/users/dto/ProfileUserDto';

import { UsersService } from './users.service';
import BasicUserDto from 'src/chat/dto/BasicUserDto';

@Controller('user')
export class UsersController {
	private logger: Logger = new Logger('UsersController');
	constructor(private readonly usersService: UsersService) { }

	// @UseGuards(AuthGuard)
	@Get('getBasicUser/:login')
	async getBasicUser(@Param() params: { login: string }) {
		const user = await this.usersService.getByLogin(params.login);
		return new BasicUserDto(user.login);
	}

	@Get('getEmail/:login')
	async getEmail(@Param() params: { login: string }) {
		const user = await this.usersService.getByLogin(params.login);
		return user.email;
	}

	// @UseGuards(JwtAuthenticationGuard) FIXME
	@Post('getUser')
	async getUser(@Body() params: any) {
		console.log('getUser: starting for ' + params.login);
		let test = new ProfileUserDto(await this.usersService.getByLogin(params.login))
		this.logger.log('getUser: ' + test.login);
		return test;
	}
	@Post('getUsers')
	async getUsers(@Body() str: string) {
		this.logger.log('getUsers: starting for ' + str.toString());
		return this.usersService.getByLoginFiltred(str);
	}
	// @Post('getAnyByLogin')
	// async getAnyByLogin(@Body() params: any) {
	// 	return this.usersService.getAnyByLogin(params.login, params.infos);
	// }
}
