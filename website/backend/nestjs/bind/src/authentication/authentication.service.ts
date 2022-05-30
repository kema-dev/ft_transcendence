import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import RegisterDto from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { PostgresErrorCode } from '../database/postgresErrorCodes.enum';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthenticationService {
	constructor(
		private readonly usersService: UsersService,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
	) {}

	public async register(registrationData: RegisterDto) {
		const hashedPassword = await bcrypt.hash(registrationData.password, 10);
		try {
			const createdUser = await this.usersService.create({
				...registrationData,
				password: hashedPassword,
			});
			createdUser.password = undefined;
			return createdUser;
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
	}

	public async getAuthenticatedUser(email: string, plainTextPassword: string) {
		try {
			const user = await this.usersService.getByEmail(email);
			await this.verifyPassword(plainTextPassword, user.password);
			user.password = undefined;
			return user;
		} catch (error) {
			throw new HttpException(
				'Wrong credentials provided',
				HttpStatus.BAD_REQUEST,
			);
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
}
