/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private readonly jwtService: JwtService) {}
	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		console.log('AuthGuard: Starting');
		// console.log('AuthGuard: Headers: ', context.switchToHttp().getRequest().headers);
		console.log(
			'AuthGuard: decoded:',
			this.jwtService.decode(
				context.switchToHttp().getRequest().headers.session,
			),
		);
		const check = this.jwtService.verify(
			context.switchToHttp().getRequest().headers.session,
		);
		console.log('AuthGuard: Returning:', check);
		return check;
	}
}

// AuthGuard: decoded:  { login: 'q', iat: 1661620454, exp: 1661706854 }
