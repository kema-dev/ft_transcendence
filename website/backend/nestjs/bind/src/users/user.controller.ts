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
import { get } from 'http';
import UserDto from './dto/user.dto';

import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
	private logger: Logger = new Logger('UsersController');
	constructor(private readonly usersService: UsersService) { }

	// @UseGuards(JwtAuthenticationGuard) FIXME
	@Post('getUser')
	async getUser(@Body() params: any) {
		this.usersService.getByLogin(params.login);
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
