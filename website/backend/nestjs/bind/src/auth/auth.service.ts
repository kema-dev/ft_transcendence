import { Injectable, Logger } from '@nestjs/common';
import { AuthModel, AuthResponse } from './auth.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(private httpService: HttpService) { }

  private users: Array<AuthModel> = []; // TODO Store users in database
  private readonly logger = new Logger(AuthService.name);
  public reset(): void {
    this.users = [];
  }
  public getAll(): Array<AuthModel> {
    return this.users;
  }
  public async create(code: string): Promise<AuthResponse> {
    this.logger.log(`START: create with code ${code}`);
    // TODO Check if code is already in use
    // TODO Check if user is already logged in
    try {
      const response = await firstValueFrom(
        this.httpService.post('https://api.intra.42.fr/oauth/token', {
          grant_type: 'authorization_code',
          client_id:
            '4b42a21a05efa463774526895b6026f4d6119d07eac916ee0670f6985f63904e',
          client_secret:
            'f5e657ee7b55efdf4754f7b00ae9ea2d96c18d54db453e8b0644668eebc8133e',
          code: code,
          redirect_uri: 'http://localhost:8080',
        }),
      );
      const logobj = await firstValueFrom(
        this.httpService.get('https://api.intra.42.fr/v2/me', {
          headers: {
            Authorization: `Bearer ${response.data.access_token}`,
          },
        }),
      );
      const maxId: number = Math.max(...this.users.map((users) => users.id), 0);
      const id: number = maxId + 1;
      const user: AuthModel = {
        code: code,
        id: id,
        accessToken: response.data.accessToken,
        tokenType: response.data.tokenType,
        expiresIn: response.data.expiresIn,
        refreshToken: response.data.refreshToken,
        scope: response.data.scope,
        createdAt: new Date(),
        login: logobj.data.login,
      };
      this.users.push(user);
      this.logger.log(`SUCCESS: create with code ${code}`);
      return { login: user.login, success: true };
    } catch (error) {
      this.logger.error(error.response.data.error_description);
      this.logger.error(`FAILURE: create with code ${code}`);
    }
    return { login: '', success: false };
  }
}
