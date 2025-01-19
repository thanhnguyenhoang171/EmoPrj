import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User, UserDocument } from './schemas/user.schema';
import aqp from 'api-query-params';
import { IUser } from './users.interface';
import mongoose from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: SoftDeleteModel<UserDocument>
  ) { }

  async create(createUserDto: CreateUserDto,) {
    const { name, email, password, role } = createUserDto;
    const createdUser = await this.userModel.create({
      name, email, password, role
    });
    return createdUser;
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
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        throw new BadRequestException("ID không hợp lệ!")
      }
      const result = await this.userModel.findById(_id);
      if (!result) {
        throw new NotFoundException("Không tìm thấy người dùng này!")
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Lỗi máy chủ nội bộ');
    }
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(_id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        throw new BadRequestException("ID không hợp lệ!")
      }
      const user = this.findOne(_id);
      if (!user) {
        throw new NotFoundException("Người dùng này không tồn tại!")
      }
      const result = await this.userModel.softDelete({ _id });
      return result;

    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException("Lỗi máy chủ nội bộ")
    }
  }
}
