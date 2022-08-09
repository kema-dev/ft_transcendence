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
import { AuthenticationService } from './authentication.service';
import RegisterDto from './dto/register.dto';
import RequestWithUser from './requestWithUser.interface';
import { LocalAuthenticationGuard } from './localAuthentication.guard';
import { JwtAuthenticationGuard } from './jwtAuthentication.guard';
import { AuthResponse } from './authResponse.interface';
import TotpDto from './dto/totp.dto';

import { Response, Request } from 'express';
import { get } from 'http';

@Controller('auth')
export class AuthenticationController {
	constructor(private readonly authenticationService: AuthenticationService) {}

	@Post('register')
	async register(@Body() registrationData: RegisterDto) {
		return this.authenticationService.register(registrationData);
	}

	@Get('status')
	check() {
		return 'Backend is up and running, you can go back to the website';
	}

	@Post('set_totp')
	set_totp(@Body('email') email: string) {
		return this.authenticationService.set_totp(email);
	}

	@Post('verify_totp')
	verify_totp(@Body() request: TotpDto) {
		return this.authenticationService.verify_totp(request);
	}

	@HttpCode(200)
	@UseGuards(LocalAuthenticationGuard)
	@Post('login')
	async logIn(@Res() response: Response) {
		// TODO add a cookie to the response and ask for mfa code
		return response.send('You successfully logged in using a password');
	}

	@HttpCode(200)
	@Post('login42')
	public async create(@Body('code') code: string): Promise<AuthResponse> {
		// TODO add a cookie to the response and ask for mfa code
		return this.authenticationService.auth42(code);
	}

	@UseGuards(JwtAuthenticationGuard)
	@Post('logout')
	async logOut(@Res() response: Response) {
		// TODO add a cookie to the response
		return response.status(200);
	}
}
