import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInUserDto {
  @ApiProperty({
    example: '+998901234567',
    description: 'Phone number of the user (Uzbekistan format)',
  })
  @IsPhoneNumber('UZ')
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({
    example: 'John@1234',
    description: 'Password of the user',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
