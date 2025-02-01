import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User, UserDocument } from './schemas/user.schema';
import aqp from 'api-query-params';
import { IUser } from './users.interface';
import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';



@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: SoftDeleteModel<UserDocument>
  ) { }


  async hashPassword(password: string) {
    let salt = await bcrypt.genSalt(10);
    let hashed_password = await bcrypt.hash(password, salt)
    return hashed_password;
  }

  async create(createUserDto: CreateUserDto, user: IUser) {
    const { name, email, password, role } = createUserDto;
    try {
      let hashed_password = await this.hashPassword(password);
      const result = await this.userModel.create({
        name, email, password: hashed_password, role, createdBy: {
          _id: user._id,
          name: user.name,
          email: user.email,
        }
      });
      return result;
    } catch (error) {
      throw new InternalServerErrorException("Lỗi máy chủ nội bộ")
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;

    // Calculate offset
    const offset = +(currentPage - 1) * (+limit);
    const defaultLimit = +limit ? +limit : 10;

    //  Get total Item vs total page
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil((totalItems) / defaultLimit);

    // Paginate
    const result = await this.userModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population as any)
      .exec()

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result
    }
  }


  async findOne(_id: string) {
    try {
      const result = await this.checkExistUser(_id);
      return result;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Lỗi máy chủ nội bộ');
    }
  }

  async findOneByEmail(email: string) {
    const result = (await this.userModel.findOne({ email }));
    return result;
  }

  // Function check exist user
  async checkExistUser(_id: string) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException("ID không hợp lệ!");
    }
    const user = await this.userModel.findOne({ _id });
    if (!user) {
      throw new NotFoundException("User này không tồn tại!");
    }
    return user;
  }

  async update(_id: string, updateUserDto: UpdateUserDto) {
    try {
      await this.checkExistUser(_id)

      const result = await this.userModel.updateOne({ _id }, {
        ...updateUserDto
      })
      return result;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException("Lỗi máy chủ nội bộ")
    }
  }

  async remove(_id: string) {
    try {
      await this.checkExistUser(_id);
      const result = await this.userModel.softDelete({ _id });
      return result;

    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException("Lỗi máy chủ nội bộ")
    }
  }

  // Create a funct use for auth
  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne(
      { _id },
      {
        refreshToken
      }
    )
  }

  // create funct regist a new user -- use for auth
  async register(user: RegisterUserDto) {
    const { name, email, password } = user;
    //add logic check email
    const isExist = await this.userModel.findOne({ email });
    if (isExist) {
      throw new BadRequestException(`Email: ${email} đã tồn tại trên hệ thống. Vui lòng sử dụng email khác.`)
    }
    const hashPassword = await this.hashPassword(password);
    let newRegister = await this.userModel.create({
      name, email,
      password: hashPassword,
    })
    return newRegister;

  }

  // Create funct to find an user by refresh token -- use for auth
  async findUserByRefreshToken(refreshToken: string) {
    return await this.userModel.findOne({ refreshToken });
  }
}
