import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UsersController } from './user.controller';
import { ChatService } from '../chat/chat.service';

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity])],
	providers: [UsersService],
	exports: [UsersService],
	controllers: [UsersController],
})
export class UsersModule { }
