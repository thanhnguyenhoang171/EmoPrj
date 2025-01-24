
import { Injectable } from '@nestjs/common';
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
        await this.usersService.updateUserToken(refresh_token, _id.toString());

        // Set refresh token as Cookies
        response.clearCookie("refresh_token");

        response.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            maxAge: ms(this.configService.get<string>('REFRESH_TOKEN_EXPIRE'))
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
}
