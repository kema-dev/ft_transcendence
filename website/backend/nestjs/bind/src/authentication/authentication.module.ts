import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'
import { AuthenticationService } from './authentication.service';
import { UsersModule } from '../users/users.module';
import { AuthenticationController } from './authentication.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

@Module({
	imports: [
		HttpModule.register({
			timeout: 5000,
			maxRedirects: 5,
		}),
		UsersModule,
		PassportModule,
		ConfigModule,
		JwtModule.registerAsync({
			inject: [ConfigService],
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_SECRET'),
				signOptions: { expiresIn: configService.get<string>('JWT_MAX_AGE') },
			}),
		}),
	],
	providers: [AuthenticationService, LocalStrategy, JwtStrategy],
	controllers: [AuthenticationController],
})
export class AuthenticationModule {}
