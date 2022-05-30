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

import { Response } from 'express';
import { Request } from 'express';

@Controller('auth')
export class AuthenticationController {
	constructor(private readonly authenticationService: AuthenticationService) {}

	@Post('register')
	async register(@Body() registrationData: RegisterDto) {
		return this.authenticationService.register(registrationData);
	}

	@HttpCode(200)
	@UseGuards(LocalAuthenticationGuard)
	@Post('log-in')
	async logIn(@Req() request: RequestWithUser, @Res() response: Response) {
		const { user } = request;
		const cookie = await this.authenticationService.getCookieFromJwt(user.id);
		response.setHeader('Set-Cookie', cookie);
		return response.send(user);
	}

	@UseGuards(JwtAuthenticationGuard)
	@Post('log-out')
	async logOut(@Res() response: Response) {
		response.setHeader(
			'Set-Cookie',
			this.authenticationService.getLogOutCookie(),
		);
		return response.status(200);
	}

	@UseGuards(JwtAuthenticationGuard)
	@Post('check-auth')
	async checkAuth(request: RequestWithUser) {
		return request.user;
	}
}
