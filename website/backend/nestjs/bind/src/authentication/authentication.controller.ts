import {
	Body,
	Req,
	Res,
	Controller,
	HttpCode,
	Post,
	UseGuards,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import RegisterDto from './dto/register.dto';
import RequestWithUser from './requestWithUser.interface';
import { LocalAuthenticationGuard } from './localAuthentication.guard';
import { JwtAuthenticationGuard } from './jwtAuthentication.guard';
import { AuthResponse } from './authResponse.interface';

import { Response, Request } from 'express';
import { get } from 'http';

@Controller('auth')
export class AuthenticationController {
	constructor(private readonly authenticationService: AuthenticationService) {}

	@Post('register')
	async register(@Body() registrationData: RegisterDto) {
		return this.authenticationService.register(registrationData);
	}

	@HttpCode(200)
	@UseGuards(LocalAuthenticationGuard)
	@Post('login')
	async logIn(@Req() request: RequestWithUser, @Res() response: Response) {
		const { user } = request;
		const cookie = await this.authenticationService.getCookieFromJwt(user.id);
		response.setHeader('Set-Cookie', cookie); // FIXME cookie setting is not working
		return response.send(user);
	}

	@HttpCode(200)
	@Post('login42')
	public async create(@Body('code') code: string): Promise<AuthResponse> {
		return this.authenticationService.auth42(code);
	}

	@UseGuards(JwtAuthenticationGuard)
	@Post('logout')
	async logOut(@Res() response: Response) {
		response.setHeader(
			'Set-Cookie',
			this.authenticationService.getLogOutCookie(),
		);
		return response.status(200);
	}
}
