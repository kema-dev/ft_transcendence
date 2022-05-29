import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { UsersModule } from '../users/users.module';
import { AuthenticationController } from './authentication.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';

@Module({
	imports: [UsersModule, PassportModule],
	providers: [AuthenticationService, LocalStrategy],
	controllers: [AuthenticationController],
})
export class AuthenticationModule {}
