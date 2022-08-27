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
	@Post('debug')
	async debug(@Headers() headers: any) {
		console.log('Debug');
		// console.log(headers);
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

	@Post('validate_token')
	validate_token(@Body() request: CheckDto) {
		return this.authenticationService.validate_token(request);
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
