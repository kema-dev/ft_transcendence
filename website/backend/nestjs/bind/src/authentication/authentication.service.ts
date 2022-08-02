import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import RegisterDto from './dto/register.dto';
// import LogInDto from './dto/logIn.dto';
import * as bcrypt from 'bcrypt';
import { PostgresErrorCode } from '../database/postgresErrorCodes.enum';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AuthResponse } from './authResponse.interface';

// NOTE - API's documentation can be found at `docs/api/v1.md`

@Injectable()
export class AuthenticationService {
	constructor(
		private readonly usersService: UsersService,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
		private httpService: HttpService,
	) {}

	public async register(registrationData: RegisterDto) {
		console.log('register: starting for login: ' + registrationData.login);
		if (registrationData.password !== registrationData.password_confirmation) {
			console.error('register: ' + 'passwords do not match, returning ✘');
			throw new HttpException('Passwords do not match', HttpStatus.BAD_REQUEST);
		}
		if (
			registrationData.password.length > 32 ||
			!registrationData.password.match(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=^[a-zA-Z0-9!@#$%^&*]*$).{10,32}$/,
			)
		) {
			console.error(
				'register: ' + 'password does not meet requirements, returning ✘',
			);
			throw new HttpException(
				'Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character (!@#$%^&*) and must be between 10 and 32 characters long',
				HttpStatus.BAD_REQUEST,
			);
		}
		if (
			registrationData.email.length > 50 ||
			!registrationData.email.match(
				/^[a-zA-Z0-9-]+(?:[\.+-][a-zA-Z0-9]+){0,}@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]{1,}){1,}$/,
			)
		) {
			console.error(
				'register: ' + 'email does not meet requirements, returning ✘',
			);
			throw new HttpException('Email is not valid', HttpStatus.BAD_REQUEST);
		}
		if (
			registrationData.login.length > 25 ||
			!registrationData.login.match(/^[a-zA-z0-9-_ ]{1,25}$/)
		) {
			console.error(
				'register: ' + 'login does not meet requirements, returning ✘',
			);
			throw new HttpException('Login is not valid', HttpStatus.BAD_REQUEST);
		}
		let hashedPassword = '';
		try {
			hashedPassword = await bcrypt.hash(registrationData.password, 10);
		} catch (error) {
			console.error('register: ' + 'bcrypt error, returning ✘');
			throw new HttpException(
				'Something went wrong',
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
		try {
			const createdUser = await this.usersService.create({
				...registrationData,
				password: hashedPassword,
				ft_code: '',
				ft_accessToken: '',
				ft_refreshToken: '',
				ft_tokenType: '',
				ft_expiresIn: 0,
				ft_scope: '',
				ft_createdAt: new Date(),
			});
			console.log(
				'register: ' + createdUser.login + ' created successfully, returning ✔',
			);
			return { login: createdUser.login, success: true };
		} catch (error) {
			if (error?.code === PostgresErrorCode.UniqueViolation) {
				console.error(
					'register: email: ' +
						registrationData.email +
						' and/or login: ' +
						registrationData.login +
						' already exists, returning ✘',
				);
				throw new HttpException(
					'User with that email and/or login already exists, please try again',
					HttpStatus.BAD_REQUEST,
				);
			}
			console.error('register: unknown error: ' + error + ' returning ✘');
			throw new HttpException(
				'Something went wrong',
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	public async getAuthenticatedUser(email: string, password: string) {
		console.log('getAuthenticatedUser: starting for email / login: ' + email);
		try {
			const user = await this.usersService.getByEmail(email);
			await this.verifyPassword(password, user.password);
			console.log(
				'getAuthenticatedUser: ' +
					user.login +
					' authenticated successfully, returning ✔',
			);
			return { login: user.login, success: true };
		} catch (error) {
			try {
				const user = await this.usersService.getByLogin(email);
				if (user.password === '') {
					console.error(
						'getAuthenticatedUser: ' +
							user.login +
							' has no password, returning ✘',
					);
					throw new HttpException(
						'User has no password, please connect using 42 API',
						HttpStatus.BAD_REQUEST,
					);
				}
				await this.verifyPassword(password, user.password);
				console.log(
					'getAuthenticatedUser: ' +
						user.login +
						' authenticated successfully, returning ✔',
				);
				return { login: user.login, success: true };
			} catch (error) {
				console.error('getAuthenticatedUser: ' + error + ' returning ✘');
				throw new HttpException(
					'Wrong credentials provided',
					HttpStatus.BAD_REQUEST,
				);
			}
		}
	}

	private async verifyPassword(
		plainTextPassword: string,
		hashedPassword: string,
	) {
		console.log('verifyPassword: starting');
		const isPasswordMatching = await bcrypt.compare(
			plainTextPassword,
			hashedPassword,
		);
		if (!isPasswordMatching) {
			console.error('verifyPassword: ' + 'mismatch');
			throw new HttpException(
				'Wrong credentials provided',
				HttpStatus.BAD_REQUEST,
			);
		}
		console.log('verifyPassword: ' + 'match, returning');
	}

	public async getCookieFromJwt(userId: number) {
		console.log('getCookieFromJwt: starting for userId: ' + userId);
		const jwtPayload = { userId };
		const jwt = await this.jwtService.sign(jwtPayload);
		console.log('getCookieFromJwt: ' + 'jwt created, returning ✔');
		return `Authentication=${jwt}; HttpOnly; Path=/; Max-Age=${this.configService.get(
			'JWT_MAX_AGE',
		)}`;
	}

	public getLogOutCookie() {
		console.log('getLogOutCookie: starting');
		console.log('getLogOutCookie: success, returning ✔');
		return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
	}

	public async checkJwt(jwt: string) {
		console.log('checkJwt: starting');
		const jwtPayload = await this.jwtService.verify(jwt);
		console.log('checkJwt: ' + 'jwt verified, returning ✔ or ✘');
		return jwtPayload;
	}

	public async auth42(code: string): Promise<AuthResponse> {
		console.log('auth42: starting');
		if (!code) {
			console.error('auth42: ' + 'no code provided, returning ✘');
			throw new HttpException('No code provided', HttpStatus.BAD_REQUEST);
		} else if ((await this.usersService.checkCodeInUse(code)) === true) {
			console.error('auth42: ' + 'code already in use, returning ✘');
			throw new HttpException('Code already in use', HttpStatus.BAD_REQUEST);
		}
		try {
			const response = await firstValueFrom(
				this.httpService.post('https://api.intra.42.fr/oauth/token', {
					grant_type: 'authorization_code',
					client_id: process.env.API_42_UID,
					client_secret: process.env.API_42_SECRET,
					code: code,
					redirect_uri: process.env.API_42_REDIRECT_URI,
				}),
			);
			const logobj = await firstValueFrom(
				this.httpService.get('https://api.intra.42.fr/v2/me', {
					headers: {
						Authorization: `Bearer ${response.data.access_token}`,
					},
				}),
			);
			if (
				(await this.usersService.checkEmailExistence(logobj.data.email)) == true
			) {
				await this.usersService.ft_update(
					logobj.data.email,
					response.data.access_token,
					response.data.expires_in,
					new Date(),
				);
				console.log('auth42: ' + logobj.data.login + ' updated, returning ✔');
				return { login: logobj.data.login, success: true };
			}
			try {
				const createdUser = await this.usersService.ft_create({
					email: logobj.data.email,
					login: logobj.data.login,
					// TODO send default password to user and / or prompt him to change it
					password: '',
					ft_code: code,
					ft_accessToken: response.data.access_token,
					ft_refreshToken: response.data.access_token,
					ft_expiresIn: response.data.expires_in,
					ft_tokenType: response.data.token_type,
					ft_scope: response.data.scope,
					ft_createdAt: new Date(),
				});
				console.log(
					'auth42: ' + createdUser.login + ' created / updated, returning ✔',
				);
				// TODO set cookie in order to stay logged in
				return { login: createdUser.login, success: true };
			} catch (error) {
				console.error('auth42: unexpected error: ' + error + ' returning ✘');
				return { login: '', success: false };
			}
		} catch (error) {
			console.error('auth42: unexpected error' + error);
		}
		console.error('auth42: ' + 'unexpected error, returning ✘');
		return { login: '', success: false };
	}
}
