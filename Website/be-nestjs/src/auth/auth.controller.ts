
import { Body, Controller, Post, HttpCode, HttpStatus, Req, UseGuards, Get, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResponseMessage } from 'src/decorator/response.decorator';
import { Response } from 'express';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { Public } from 'src/decorator/auth_global.decorator';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage("User signIn")
  async signIn(
    @Req() req,
    @Res({ passthrough: true }) response: Response
  ) {
    return this.authService.signIn(req.user, response);
  }

  @Post('/register')
  @Public()
  @ResponseMessage("Regist a new user")
  async registry(
    @Body() registerUserDto: RegisterUserDto
  ) {
    return this.authService.registryUser(registerUserDto);
  }
}