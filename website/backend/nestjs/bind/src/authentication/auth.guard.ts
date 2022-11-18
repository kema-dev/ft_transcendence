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
		// console.log(
		// 	'AuthGuard: cookie:',
		// 	context.switchToHttp().getRequest().headers.cookie,
		// );
		// extract session cookie
		const cookie = context.switchToHttp().getRequest().headers.cookie;
		const cookieArray = cookie.split(';');
		// extract work after 'session=' using regex
		const session = cookieArray[0].match(/session=(.*)/)[1];
		if (!session) {
			console.log('AuthGuard: No session');
			return false;
		}
		// console.log('AuthGuard: Headers: ', context.switchToHttp().getRequest().headers);
		// console.log('AuthGuard: session: ', context.switchToHttp().getRequest().headers.session);
		const decoded_obj = this.jwtService.decode(session);
		let check = this.jwtService.verify(session);
		const decoded_login = JSON.parse(JSON.stringify(decoded_obj)).login;
		// console.log('Decoded login:', decoded_login);
		const req_login = cookieArray[1].match(/login=(.*)/)[1];
		if (!req_login) {
			console.log('AuthGuard: No login');
			return false;
		} else if (decoded_login != req_login) {
			console.log('AuthGuard: Impersonation detected');
			check = false;
		}
		// console.log('AuthGuard:req_login: ', req_login);
		// console.log('AuthGuard: Returning:', check);
		return check;
	}
}

// AuthGuard: decoded:  { login: 'q', iat: 1661620454, exp: 1661706854 }
