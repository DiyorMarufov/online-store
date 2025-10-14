import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ConfirmOtpDto {
  @ApiProperty({
    example: 'johndoe@gmail.com',
    description: 'Email address of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '123456',
    description: '6-digit OTP code sent to the user email address',
  })
  @IsString()
  @IsNotEmpty()
  otp: string;
}
