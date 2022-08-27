import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly authenticationService: AuthenticationService,
		private readonly jwtService: JwtService,
	) {}
	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		console.log('AuthGuard: Starting');
		const request = context.switchToHttp().getRequest();
		console.log(
			'AuthGuard: decoded: ', this.jwtService.decode(request.headers.token),
		);
		const check = this.jwtService.verify(request.headers.token);
		console.log('AuthGuard: Returning: ', check);
		return check;
	}
}

// AuthGuard: decoded:  { login: 'q', iat: 1661620454, exp: 1661706854 }
