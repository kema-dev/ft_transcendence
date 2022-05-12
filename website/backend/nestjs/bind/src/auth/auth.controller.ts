import { Controller, Post, Body, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResponse } from './auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  public async create(@Body('code') code: string): Promise<AuthResponse> {
    return this.authService.create(code);
  }
  @Post('reset')
  public reset(): void {
    this.authService.reset();
  }
}
