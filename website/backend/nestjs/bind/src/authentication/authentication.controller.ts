import {
	Body,
	Req,
	Controller,
	HttpCode,
	Post,
	UseGuards,
	Res,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import RegisterDto from './dto/register.dto';
import RequestWithUser from './requestWithUser.interface';
import { LocalAuthenticationGuard } from './localAuthentication.guard';
import { JwtAuthenticationGuard } from './jwtAuthentication.guard';

@Controller('authentication')
export class AuthenticationController {
	constructor(private readonly authenticationService: AuthenticationService) {}

	@Post('register')
	async register(@Body() registrationData: RegisterDto) {
		return this.authenticationService.register(registrationData);
	}

	@HttpCode(200)
	@UseGuards(LocalAuthenticationGuard)
	@Post('log-in')
	async logIn(@Req() req: RequestWithUser, @Res() res: Response) {
		const { user } = req;
		const cookie = await this.authenticationService.getCookieFromJwt(user.id);
		res.headers.set('Set-Cookie', cookie);
		return {
			user,
		};
	}

	@UseGuards(JwtAuthenticationGuard)
	@Post('log-out')
	async logOut(@Req() request: RequestWithUser, @Res() response: Response) {
		response.headers.set(
			'Set-Cookie',
			this.authenticationService.getLogOutCookie(),
		);
		return response.status.toFixed(200);
	}

	@UseGuards(JwtAuthenticationGuard)
	@Post('refresh-token')
	async refreshToken(
		@Req() request: RequestWithUser,
		@Res() response: Response,
	) {
		const cookie = await this.authenticationService.getCookieFromJwt(
			request.user.id,
		);
		response.headers.set('Set-Cookie', cookie);
		return response.status.toFixed(200);
	}

	@UseGuards(JwtAuthenticationGuard)
	@Post('check-auth')
	async checkAuth(@Req() request: RequestWithUser) {
		return request.user;
	}
}
