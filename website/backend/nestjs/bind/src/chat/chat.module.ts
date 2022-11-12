/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { UserEntity } from '../users/user.entity';
import { MessageEntity } from './entites/message.entity';
import { PrivateEntity } from './entites/private.entity';
import { UsersService } from '../users/users.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
// import { AuthenticationService } from '../authentication/authentication.service';
import { ChannelEntity } from './entites/channel.entity';
import { AppGateway } from '../app.gateway';
import { SanctionEntity } from './entites/sanction.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			UserEntity,
			PrivateEntity,
			ChannelEntity,
			MessageEntity,
			SanctionEntity,
		]),
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
				signOptions: { expiresIn: 86400 },
			}),
		}),
	],
	// exports: [ChatService, AppGateway],
	// providers: [ChatService, UsersService, AppGateway],
	exports: [ChatService],
	providers: [ChatService, UsersService],
	controllers: [ChatController],
})
export class ChatModule {}
