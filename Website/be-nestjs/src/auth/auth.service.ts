
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { access } from 'fs';
@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private readonly jwtService: JwtService
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

    // SignIn and generate access_token
    async signIn(user: any) {
        const payload = { _id: user._id, name: user.name, email: user.email, role: user.role };
        return {
            access_token: this.jwtService.sign(payload)
        }
    }
}
