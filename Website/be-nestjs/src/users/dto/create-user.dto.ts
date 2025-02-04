import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
export class CreateUserDto {
    @IsString({ message: 'Tên phải là chuỗi' })
    @IsNotEmpty({ message: 'Tên không được để trống' })
    name: string;

    @IsEmail({}, { message: 'Email không đúng định dạng' })
    email: string;

    @IsString({ message: 'Mật khẩu phải là chuỗi' })
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    password: string;

    @IsString({ message: 'Role phải là chuỗi' })
    role: string

}

export class RegisterUserDto {
    @IsString({ message: 'Tên phải là chuỗi' })
    @IsNotEmpty({ message: 'Tên không được để trống' })
    name: string;

    @IsEmail({}, { message: 'Email không đúng định dạng' })
    email: string;

    @IsString({ message: 'Mật khẩu phải là chuỗi' })
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    password: string;

}