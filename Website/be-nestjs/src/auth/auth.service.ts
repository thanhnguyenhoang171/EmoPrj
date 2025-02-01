
import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { access } from 'fs';
import { IUser } from 'src/users/users.interface';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import * as ms from 'ms';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private readonly jwtService: JwtService,
        private configService: ConfigService
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(username);

        // encode password
        const isValidPassword = await bcrypt.compare(pass, user.password)
        if (isValidPassword) {
            // Check valid username
            if (username === user.email) {
                return user;
            }
        }

        return null;
    }

    // generate refresh token
    createRefreshToken = (payload: any) => {
        const refresh_token = this.jwtService.sign(payload,
            {
                secret: this.configService.get<string>("REFRESH_SECRET_KEY"),
                expiresIn: ms(this.configService.get<string>("REFRESH_TOKEN_EXPIRE")) / 1000,
            }
        );
        return refresh_token;
    }

    // SignIn and generate access_token
    async signIn(user: IUser, response: Response) {
        const { _id, name, email, role } = user;

        // Customize Payload
        const payload = {
            sub: "SignIn Token",
            iss: "From Server",
            _id,
            name,
            email,
            role
        }

        // Initial refresh token 
        const refresh_token = this.createRefreshToken(payload);

        // Update user with refresh token -- in User Module
        await this.usersService.updateUserToken(refresh_token, _id);

       

        response.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            maxAge: ms(this.configService.get<string>('REFRESH_TOKEN_EXPIRE')),
            sameSite: 'strict', // Chống tấn công CSRF
        })


        return {
            access_token: this.jwtService.sign(payload),
            user: {
                _id,
                name,
                email,
                role
            }
        }
    }
    // create funct allow regist a new user
    async registryUser(user: RegisterUserDto) {
        const registUser = await this.usersService.register(user);

        return {
            _id: registUser?._id,
            createdAt: registUser?.createdAt
        }
    }

    // Create new access token by refresh token
    processNewToken = async (refreshToken: string, response: Response) => {
        try {
            // authentication refresh token - encode refresh token
            this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>("REFRESH_SECRET_KEY")
            });
            // find an user by token
            let user = await this.usersService.findUserByRefreshToken(refreshToken);
            if (user) {
                const { _id, name, email, role } = user;
                // initial payload
                const payload = {
                    sub: "refresh token",
                    iss: "from server",
                    _id,
                    name,
                    email,
                    role
                };

                // create new refresh token
                const refresh_token = this.createRefreshToken(payload);

                //update user with new refresh token
                await this.usersService.updateUserToken(refresh_token, _id.toString());

                // set new refresh token to cookies
                response.clearCookie("refresh_token");

                response.cookie("refresh_token", refresh_token, {
                    httpOnly: true,
                    maxAge: ms(this.configService.get<string>("REFRESH_TOKEN_EXPIRE")),
                    sameSite: 'strict', // Chống tấn công CSRF
                });

                return {
                    access_token: this.jwtService.sign(payload), // sign again access token to remain login
                    user: {
                        _id,
                        name,
                        email,
                        role
                    }
                }
            }
            else {
                throw new BadRequestException("Refresh token không hợp lệ. Vui lòng đăng nhập lại");
            }
        } catch (error) {
            throw new BadRequestException("Refresh token không hợp lệ. Vui lòng đăng nhập lại")
        }
    }

    // Define funct to logout
    logout = async (response: Response, user: IUser) => {
        await this.usersService.updateUserToken("", user._id);
        response.clearCookie("refresh_token");
        return "ok";
    }
}
