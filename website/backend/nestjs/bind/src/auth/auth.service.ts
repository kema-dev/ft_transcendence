import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AuthModel } from './auth.interface';
import { HttpService } from '@nestjs/axios';
import { access } from 'fs';

@Injectable()
export class AuthService {
  constructor(private httpService: HttpService) { }

  private users: Array<AuthModel> = [];
  private readonly logger = new Logger(AuthService.name);
  public create(user: AuthModel): AuthModel {
    // TODO check if user already exists
    const maxId: number = Math.max(...this.users.map((users) => users.id), 0);
    const id: number = maxId + 1;
    this.httpService
      .post('https://api.intra.42.fr/oauth/token', {
        grant_type: 'authorization_code',
        client_id:
          '4b42a21a05efa463774526895b6026f4d6119d07eac916ee0670f6985f63904e',
        client_secret:
          'f5e657ee7b55efdf4754f7b00ae9ea2d96c18d54db453e8b0644668eebc8133e',
        code: user.code,
        redirect_uri: 'http://localhost:8080',
      })
      .forEach((response) => {
        user.accessToken = response.data.access_token;
        user.tokenType = response.data.token_type;
        user.expiresIn = response.data.expires_in;
        user.refreshToken = response.data.refresh_token;
        user.scope = response.data.scope;
        user.createdAt = response.data.created_at;
        this.httpService
          .get('https://api.intra.42.fr/v2/me', {
            headers: {
              'Authorization': `Bearer ${user.accessToken}`
            }
          })
          .forEach((response) => {
            user.data = response.data;
          });
        this.logger.log('User created:', user);
        this.logger.log('data:', user.data); // TODO find a way to retrieve data
      })
      .catch((error) => {
        this.logger.log(error);
      });
    const newUser: AuthModel = {
      ...user,
      id,
      // TODO add accessToken and username
    };
    this.users.push(newUser);
    return newUser;
  }
  public reset(): void {
    this.users = [];
  }
}
