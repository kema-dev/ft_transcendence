import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseModule } from './database/database.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { SocketModule } from './socket/socket.module';

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
		DatabaseModule,
		AuthenticationModule,
		UsersModule,
		ChatModule,
		SocketModule
	],
	controllers: [],
	providers: [],
})
export class AppModule {}