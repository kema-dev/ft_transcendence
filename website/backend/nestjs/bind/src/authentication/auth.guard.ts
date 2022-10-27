/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { JwtService } from '@nestjs/jwt';
import { json } from 'stream/consumers';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private readonly jwtService: JwtService) {}
	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		// console.log('AuthGuard: Starting');
		// console.log('AuthGuard: Headers: ', context.switchToHttp().getRequest().headers);
		const decoded_obj = this.jwtService.decode(
			context.switchToHttp().getRequest().headers.session,
		);
		let check = this.jwtService.verify(
			context.switchToHttp().getRequest().headers.session,
		);
		const decoded_login = JSON.parse(JSON.stringify(decoded_obj)).login;
		// console.log('Decoded login:', decoded_login);
		const req_login = context.switchToHttp().getRequest().headers.login;
		// console.log('AuthGuard:req_login: ', req_login);
		if (decoded_login != req_login) {
			console.log('AuthGuard: Impersonation detected');
			check = false;
		}
		// console.log('AuthGuard: Returning:', check);
		return check;
	}
}

// AuthGuard: decoded:  { login: 'q', iat: 1661620454, exp: 1661706854 }
