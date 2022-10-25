/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	Body,
	Controller,
	HttpCode,
	Post,
	Get,
	Headers,
	UseGuards,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import RegisterDto from './dto/register.dto';
import TotpDto from './dto/totp.dto';
import LogInDto from './dto/logIn.dto';
import CheckDto from './dto/check.dto';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthenticationController {
	constructor(private readonly authenticationService: AuthenticationService) {}

	@UseGuards(AuthGuard)
	@Get('debug')
	async debug_get(@Headers() headers: any) {
		console.log('Debug headers: ' + JSON.stringify(headers));
	}

	@UseGuards(AuthGuard)
	@Post('debug')
	async debug_post(@Headers() headers: any) {
		console.log('Debug headers: ' + JSON.stringify(headers));
	}

	@Post('disable_totp')
	async disable_totp(@Body() data: any) {
		this.authenticationService.disable_totp(data.name);
	}

	@Post('check_totp_status')
	async check_totp_status(@Body() data: any) {
		return this.authenticationService.check_totp_status(data.name);
	}

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

	@Get('validate_token')
	validate_token(@Headers() request: any) {
		const credentials = {
			login: request.login,
			token: request.token,
		};
		return this.authenticationService.validate_token(credentials);
	}

	@UseGuards(AuthGuard)
	@Post('set_totp')
	set_totp(@Body('email') email: string) {
		return this.authenticationService.set_totp(email);
	}

	@UseGuards(AuthGuard)
	@Post('set_tmp_totp')
	set_tmp_totp(@Body('email') email: string) {
		return this.authenticationService.set_tmp_totp(email);
	}

	@UseGuards(AuthGuard)
	@Post('verify_totp')
	verify_totp(@Body() request: TotpDto) {
		return this.authenticationService.verify_totp(request);
	}

	@UseGuards(AuthGuard)
	@Post('verify_tmp_totp')
	verify_tmp_totp(@Body() request: TotpDto) {
		return this.authenticationService.verify_tmp_totp(request);
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

	@UseGuards(AuthGuard)
	@HttpCode(200)
	@Post('logout')
	async logOut(@Body() body: { login: string }) {
		return this.authenticationService.logOut(body.login);
	}

	@HttpCode(200)
	@Post('login42')
	public async create(@Body('code') code: string) {
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
}
