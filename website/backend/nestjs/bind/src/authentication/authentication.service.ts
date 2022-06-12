import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import RegisterDto from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { PostgresErrorCode } from '../database/postgresErrorCodes.enum';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AuthResponse } from './authResponse.interface';

@Injectable()
export class AuthenticationService {
	constructor(
		private readonly usersService: UsersService,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
		private httpService: HttpService,
	) {}

	public async register(registrationData: RegisterDto) {
		const hashedPassword = await bcrypt.hash(registrationData.password, 10);
		try {
			const createdUser = await this.usersService.create({
				...registrationData,
				password: hashedPassword,
				ft_code: '',
				ft_accessToken: '',
				ft_tokenType: '',
				ft_expiresIn: 0,
				ft_refreshToken: '',
				ft_scope: '',
				ft_createdAt: new Date(),
			});
			return { login: createdUser.name, success: true };
		} catch (error) {
			if (error?.code === PostgresErrorCode.UniqueViolation) {
				throw new HttpException(
					'User with that email already exists',
					HttpStatus.BAD_REQUEST,
				);
			}
			throw new HttpException(
				'Something went wrong',
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
		// TODO add console logging
	}

	public async getAuthenticatedUser(email: string, plainTextPassword: string) {
		try {
			const user = await this.usersService.getByEmail(email);
			await this.verifyPassword(plainTextPassword, user.password);
			return { login: user.name, success: true };
		} catch (error) {
			throw new HttpException(
				'Wrong credentials provided',
				HttpStatus.BAD_REQUEST,
			);
		}
		// TODO add console logging
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
			throw new HttpException(
				'Wrong credentials provided',
				HttpStatus.BAD_REQUEST,
			);
		}
	}

	public async getCookieFromJwt(userId: number) {
		const jwtPayload = { userId };
		const jwt = await this.jwtService.sign(jwtPayload);
		return `Authentication=${jwt}; HttpOnly; Path=/; Max-Age=${this.configService.get(
			'JWT_MAX_AGE',
		)}`;
	}

	public getLogOutCookie() {
		return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
	}

	private checkLogin(login: string): boolean {
		// TODO check if login is already existing
		return false;
	}

	private readonly logger = new Logger(AuthenticationService.name);

	public async auth42(code: string): Promise<AuthResponse> {
		// TODO Check if code is already in use
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
			if (this.checkLogin(logobj.data.login) === true) {
				// TODO refresh token / cookie from our db and from 42 api
			} else {
				try {
					const createdUser = await this.usersService.ft_create({
						email: logobj.data.email,
						name: logobj.data.login,
						password: '', // FIXME generate random password and send it to user
						ft_code: code,
						ft_accessToken: response.data.access_token,
						ft_refreshToken: response.data.refresh_token,
						ft_expiresIn: response.data.expires_in,
						ft_tokenType: response.data.token_type,
						ft_scope: response.data.scope,
						ft_createdAt: new Date(),
					});
					this.logger.log(`SUCCESS: create with code ${code}`);
					// TODO set cookie
					return { login: createdUser.name, success: true };
				} catch (error) {
					throw new HttpException(
						'Something went wrong',
						HttpStatus.INTERNAL_SERVER_ERROR,
					);
				}
			}
		} catch (error) {
			this.logger.error(error.response.data.error_description);
			this.logger.error(`FAILURE: create with code ${code}`);
		}
		return { login: '', success: false };
	}
	// TODO add console logging
}
