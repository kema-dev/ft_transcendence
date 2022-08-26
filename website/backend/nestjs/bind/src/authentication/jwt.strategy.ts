import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private authService: AuthenticationService) {
		super();
	}

	async validate(login: string, token: string): Promise<any> {
		const check = await this.authService.validate_token({ login, token });
		if (check !== true) {
			throw new UnauthorizedException();
		}
		return check;
	}
}
