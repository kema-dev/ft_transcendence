/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseModule } from './database/database.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { AppGateway } from './app.gateway';
import { MatchModule } from './match/match.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
	imports: [
		ConfigModule.forRoot({
			validationSchema: Joi.object({
				POSTGRES_HOST: Joi.string().required(),
				POSTGRES_PORT: Joi.number().required(),
				POSTGRES_USER: Joi.string().required(),
				POSTGRES_PASSWORD: Joi.string().required(),
				POSTGRES_DB: Joi.string().required(),
				PORT: Joi.number(),
				JWT_SECRET: Joi.string().required(),
				JWT_MAX_AGE: Joi.string().required(),
				API_42_UID: Joi.string().required(),
				API_42_SECRET: Joi.string().required(),
				API_42_REDIRECT_URI: Joi.string().required(),
			}),
		}),
		JwtModule.registerAsync({
			inject: [ConfigService],
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_SECRET'),
				signOptions: { expiresIn: '1d' },
			}),
		}),
		DatabaseModule,
		AuthenticationModule,
		UsersModule,
		ChatModule,
		MatchModule,
	],
	controllers: [],
	providers: [AppGateway],
})
export class AppModule {}
