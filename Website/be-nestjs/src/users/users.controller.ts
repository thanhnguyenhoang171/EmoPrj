import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from 'src/decorator/user.decorator';
import { IUser } from './users.interface';
import { ResponseMessage } from 'src/decorator/response.decorator';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ResponseMessage("Create a new user")
  create(

    @Body() createUserDto: CreateUserDto,
    // @User() user: IUser
  ) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ResponseMessage("Fetch all users with pagination")
  findAll(
    @Query("current") currentPage: number,
    @Query("pageSize") limit: number,
    @Query() qs: string
  ) {
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage("Get a user by id")
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ResponseMessage("Delete a user by id")
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
