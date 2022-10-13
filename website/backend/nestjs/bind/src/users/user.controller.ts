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
import { BasicUserDto } from 'src/chat/dto/BasicUserDto';

@Controller('user')
export class UsersController {
	private logger: Logger = new Logger('UsersController');
	constructor(private readonly usersService: UsersService) {}

	// @UseGuards(AuthGuard)
	// @Get('getMyProfile/:login')
	// async getMyProfile(@Param() params: { login: string }) {
	// 	console.log(`Get profile for user '${params.login}'`)
	// 	const user = await this.usersService.getByLogin(params.login, {
	// 		friends: true,
	// 		requestFriend: true,
	// 		blockeds: true
	// 	});
	// 	console.log()
	// 	return new ProfileUserDto(user);
	// }

	@UseGuards(AuthGuard)
	@Get('getBasicUser/:login')
	async getBasicUser(@Param() params: { login: string }) {
		console.log(`login = ${params.login}`)
		const user = await this.usersService.getByLogin(params.login);
		return new BasicUserDto(user.login, user.avatar);
	}

	@UseGuards(AuthGuard)
	@Get('getEmail/:login')
	async getEmail(@Param() params: { login: string }) {
		const user = await this.usersService.getByLogin(params.login);
		return user.email;
	}

	@UseGuards(AuthGuard)
	@Post('getUser')
	async getUser(@Body() params: any) {
		console.log('getUser: starting for ' + params.login);
		let test = new ProfileUserDto(
			await this.usersService.getByLogin(params.login),
		);
		this.logger.log('getUser: ' + test.login);
		return test;
	}
	@UseGuards(AuthGuard)
	@Post('getUsers')
	async getUsers(@Body() str: string) {
		this.logger.log('getUsers: starting for ' + str.toString());
		return this.usersService.getByLoginFiltred(str);
	}
	// @Post('getAnyByLogin')
	// async getAnyByLogin(@Body() params: any) {
	// 	return this.usersService.getAnyByLogin(params.login, params.infos);
	// }
	@UseGuards(AuthGuard)
	@Post('get_user_avatar')
	async get_user_avatar(@Body() params: any) {
		return this.usersService.get_user_avatar(params.login);
	}
}
