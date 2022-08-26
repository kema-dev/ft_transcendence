import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from '../users/users.service';
import { AuthenticationService } from './authentication.service';
import CheckDto from './dto/check.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly configService: ConfigService,
		private readonly userService: UsersService,
		private readonly authenticationService: AuthenticationService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromHeader('token'),
			secretOrKey: configService.get('JWT_SECRET'),
		});
	}

	async validate(login: string, token: string): Promise<any> {
		const obj = {
			login: login,
			token: token,
		};
		console.log('JwtStrategy validate');
		return this.authenticationService.validate_token(obj);
	}
}
