
import { Body, Controller, Post, HttpCode, HttpStatus, Req, Res, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResponseMessage } from 'src/decorator/response.decorator';
import { Response } from 'express';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ResponseMessage("User signIn")
  async signIn(
    @Req() req
  ) {
    return this.authService.signIn(req.user);
  }

  @UseGuards(JwtAuthGuard)  //assign req.user
  @ResponseMessage("Get profile user signIn")
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }
}
