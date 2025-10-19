import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Status } from 'src/common/enum';

export class UpdateUserStatusDto {
  @ApiProperty({
    description: 'User status (active/inactive)',
    enum: Status,
    example: Status.ACTIVE,
  })
  @IsEnum(Status, { message: 'Status must be either active or inactive' })
  status: Status;
}
