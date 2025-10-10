import { Controller, Post, Body, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInUserDto } from './dto/sign-in.dto';
import { Response } from 'express';
import { UsersRoles } from 'src/common/enum';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('admin')
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Admin user successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createAdmin(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUserByRole(createUserDto, UsersRoles.ADMIN);
  }

  @Post('merchant')
  @ApiOperation({ summary: 'Create a new merchant user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Merchant user successfully created',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createMerchant(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUserByRole(
      createUserDto,
      UsersRoles.MERCHANT,
    );
  }

  @Post('signin')
  @ApiOperation({ summary: 'Sign in a user' })
  @ApiResponse({
    status: 200,
    description: 'User signed in successfully',
    schema: {
      example: {
        message: 'Login successful',
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid phone number or password',
    schema: {
      example: {
        message: 'Invalid credentials',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  async signInUser(
    @Body() signInUserDto: SignInUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.usersService.signInUser(signInUserDto, res);
  }
}
