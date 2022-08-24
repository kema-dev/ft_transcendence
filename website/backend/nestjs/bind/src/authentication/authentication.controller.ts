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
import { JwtAuthenticationGuard } from './jwtAuthentication.guard';
import { AuthResponse } from './authResponse.interface';
import TotpDto from './dto/totp.dto';
import { Response, Request } from 'express';
import LogInDto from './dto/logIn.dto';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';

@Controller('auth')
export class AuthenticationController {
	constructor(private readonly authenticationService: AuthenticationService) {}

	@Post('register')
	async register(@Body() registrationData: RegisterDto) {
		let usr;
		try {
			usr = await this.authenticationService.register(registrationData);
		} catch (error) {
			throw error;
		}
		let cookie;
		try {
			cookie = await this.authenticationService.createCookie(usr.login);
		} catch (error) {
			throw error;
		}
		console.log('Login: ' + usr.login + ' Success: ' + usr.success);
		return {
			login: usr.login,
			success: usr.success,
			key: cookie.key,
			value: cookie.value,
		};
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
	@Post('login')
	async logIn(@Body() body: LogInDto) {
		let usr;
		try {
			usr = await this.authenticationService.getAuthenticatedUser(
				body.email,
				body.password,
				body.mfa,
			);
		} catch (error) {
			throw error;
		}
		let cookie;
		try {
			cookie = await this.authenticationService.createCookie(usr.login);
		} catch (error) {
			throw error;
		}
		console.log('Login: ' + usr.login + ' Success: ' + usr.success);
		return {
			login: usr.login,
			success: usr.success,
			key: cookie.key,
			value: cookie.value,
		};
	}

	@HttpCode(200)
	@Post('login42')
	public async create(@Body('code') code: string) {
		// TODO add a cookie to the response
		let usr;
		try {
			usr = await this.authenticationService.auth42(code);
		} catch (error) {
			throw error;
		}
		let cookie;
		try {
			cookie = await this.authenticationService.createCookie(usr.login);
		} catch (error) {
			throw error;
		}
		console.log('Login: ' + usr.login + ' Success: ' + usr.success);
		return {
			login: usr.login,
			success: usr.success,
			key: cookie.key,
			value: cookie.value,
		};
	}

	@UseGuards(JwtAuthenticationGuard)
	@Post('logout')
	async logOut(@Res() response: Response) {
		// TODO add a cookie to the response
		return response.status(200);
	}
}
