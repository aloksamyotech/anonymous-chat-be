import { IsString, IsEmail, IsOptional, IsBoolean , IsNotEmpty} from 'class-validator';
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class OtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  
  @IsNotEmpty()
  otp: string;
}