import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { UsersRoles } from 'src/common/enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsEnum(UsersRoles)
  @IsOptional()
  role?: UsersRoles;
}
