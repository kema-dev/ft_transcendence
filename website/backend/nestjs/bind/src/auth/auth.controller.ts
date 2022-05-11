import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthModel } from './auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post()
  public create(@Body() user: AuthModel): AuthModel {
    return this.authService.create(user);
  }
  @Post('reset')
  public reset(): void {
    this.authService.reset();
  }
}
