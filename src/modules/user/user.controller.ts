import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, OtpDto } from './user.dto';


@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) { }
  
  @Post('login')
  async create(@Body() body: CreateUserDto) {
    return this.userService.createUser(body);
  }

  @Post('verify-otp')
  async verify(@Body() body: OtpDto) {
    return this.userService.verifyOtp(body)
  }
}