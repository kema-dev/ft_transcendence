import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'
import { AuthenticationService } from '../authentication/authentication.service';
import { UsersModule } from '../users/users.module';
import { AuthenticationController } from '../authentication/authentication.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { MatchEntity } from './match.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([MatchEntity]),
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
	providers: [MatchService, MatchEntity],
	controllers: [MatchController],
})
export class MatchModule {}
