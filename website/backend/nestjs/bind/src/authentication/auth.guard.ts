import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private readonly authenticationService: AuthenticationService) {}
	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const request = context.switchToHttp().getRequest();
		console.log(request.headers);
		return this.authenticationService.validate_token({
			login: request.headers.login,
			token: request.headers.token,
		});
	}
}
