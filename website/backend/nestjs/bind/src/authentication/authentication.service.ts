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
import * as crypto from 'crypto';

@Injectable()
export class AuthenticationService {
	constructor(
		private readonly usersService: UsersService,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
		private httpService: HttpService,
	) {}

	public async register(registrationData: RegisterDto) {
		console.error('register: ' + registrationData.login);
		if (registrationData.password !== registrationData.password_confirmation) {
			throw new HttpException('Passwords do not match', HttpStatus.BAD_REQUEST);
		}
		if (
			!registrationData.password.match(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=^[a-zA-Z0-9!@#$%^&*]*$).{10,32}$/,
			)
		) {
			throw new HttpException(
				'Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character (!@#$%^&*) and must be between 10 and 32 characters long',
				HttpStatus.BAD_REQUEST,
			);
		}
		if (
			!registrationData.email.match(
				/^[a-zA-Z0-9-]+(?:[\.+-][a-zA-Z0-9]+){0,}@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]{1,}){1,}$/,
			)
		) {
			throw new HttpException('Email is not valid', HttpStatus.BAD_REQUEST);
		}
		if (!registrationData.login.match(/^[a-zA-z0-9-_ ]{1,25}$/)) {
			throw new HttpException('Login is not valid', HttpStatus.BAD_REQUEST);
		}
		const hashedPassword = await bcrypt.hash(registrationData.password, 10);
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
			console.log('register: ' + createdUser.login + ' created');
			return { login: createdUser.login, success: true };
		} catch (error) {
			if (error?.code === PostgresErrorCode.UniqueViolation) {
				console.error(
					'register: ' + registrationData.email + ' and/or ' + registrationData.login + ' already exists',
				);
				throw new HttpException(
					'User with that email and/or login already exists',
					HttpStatus.BAD_REQUEST,
				);
			}
			console.error('register: ' + error);
			throw new HttpException(
				'Something went wrong',
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	public async getAuthenticatedUser(email: string, password: string) {
		console.error('getAuthenticatedUser: ' + email);
		try {
			const user = await this.usersService.getByEmail(email);
			await this.verifyPassword(password, user.password);
			console.log('getAuthenticatedUser: ' + user.login + ' authenticated');
			return { login: user.login, success: true };
		} catch (error) {
			try {
				const user = await this.usersService.getByLogin(email);
				await this.verifyPassword(password, user.password);
				console.log('getAuthenticatedUser: ' + user.login + ' authenticated');
				return { login: user.login, success: true };
			} catch (error) {
				console.error('getAuthenticatedUser: ' + error);
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
		console.log('verifyPassword: ' + 'match');
	}

	public async getCookieFromJwt(userId: number) {
		const jwtPayload = { userId };
		const jwt = await this.jwtService.sign(jwtPayload);
		console.log('getCookieFromJwt: ' + 'jwt created');
		return `Authentication=${jwt}; HttpOnly; Path=/; Max-Age=${this.configService.get(
			'JWT_MAX_AGE',
		)}`;
	}

	public getLogOutCookie() {
		console.log('getLogOutCookie: ' + 'cookie created');
		return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
	}

	public async checkJwt(jwt: string) {
		const jwtPayload = await this.jwtService.verify(jwt);
		console.log('checkJwt: ' + 'jwt verified');
		return jwtPayload;
	}

	public async auth42(code: string): Promise<AuthResponse> {
		if (!code) {
			console.log('auth42: ' + 'no code provided');
			throw new HttpException('No code provided', HttpStatus.BAD_REQUEST);
		} else if ((await this.usersService.checkCodeInUse(code)) === true) {
			console.log('auth42: ' + 'code already in use');
			throw new HttpException('Code already in use', HttpStatus.BAD_REQUEST);
		}
		try {
			const response = await firstValueFrom(
				this.httpService.post('https://api.intra.42.fr/oauth/token', {
					grant_type: 'authorization_code',
					client_id: process.env.API_42_CLIENT_ID,
					client_secret: process.env.API_42_CLIENT_SECRET,
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
					response.data.email,
					response.data.access_token,
					response.data.expires_in,
					new Date(),
				);
				console.log('auth42: ' + logobj.data.login + ' updated');
				return { login: logobj.data.login, success: true };
			}
			try {
				const password = crypto.randomBytes(16).toString('hex');
				const createdUser = await this.usersService.ft_create({
					email: logobj.data.email,
					login: logobj.data.login,
					password: password, // TODO send default password to user and / or prompt him to change it
					ft_code: code,
					ft_accessToken: response.data.access_token,
					ft_refreshToken: response.data.access_token,
					ft_expiresIn: response.data.expires_in,
					ft_tokenType: response.data.token_type,
					ft_scope: response.data.scope,
					ft_createdAt: new Date(),
				});
				console.log('auth42: ' + createdUser.login + ' created');
				// TODO set cookie
				return { login: createdUser.login, success: true };
			} catch (error) {
				console.error('auth42: ' + error);
				throw new HttpException(
					'Something went wrong',
					HttpStatus.INTERNAL_SERVER_ERROR,
				);
			}
		} catch (error) {
			console.error('auth42: ' + error);
		}
		console.error('auth42: ' + 'returning false');
		return { login: '', success: false };
	}
}
