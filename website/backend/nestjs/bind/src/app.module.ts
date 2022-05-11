import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PostsModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
