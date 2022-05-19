import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResponse, AuthModel } from './auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  public async create(@Body('code') code: string): Promise<AuthResponse> {
    return this.authService.create(code);
  }
  @Get('getUsers')
  public getAll(): Array<AuthModel> { // TODO Debugging purpose function, needs to be removed
    return this.authService.getAll();
  }
  @Post('reset')
  public reset(): void {
    this.authService.reset();
  }
}
