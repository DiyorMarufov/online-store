import { Controller, Post, Body, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInUserDto } from './dto/sign-in.dto';
import { Response } from 'express';
import { UsersRoles } from 'src/common/enum';
import { ConfirmOtpDto } from './dto/confirm-otp.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('admin')
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Admin user successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  createAdmin(@Body() createUserDto: CreateUserDto) {
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
  createMerchant(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUserByRole(
      createUserDto,
      UsersRoles.MERCHANT,
    );
  }

  @Post('confirm-otp/customer')
  @ApiOperation({ summary: 'Confirm OTP for customer' })
  @ApiBody({ type: ConfirmOtpDto })
  @ApiResponse({
    status: 200,
    description: 'OTP successfully confirmed',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired OTP',
  })
  confirmOtpCustomer(@Body() confirmOtpCustomer: ConfirmOtpDto) {
    return this.usersService.confirmOtpCustomer(confirmOtpCustomer);
  }

  @Post('signin/customer')
  @ApiOperation({ summary: 'Sign in customer' })
  @ApiBody({ type: SignInUserDto })
  @ApiResponse({
    status: 200,
    description: 'Customer signed in successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email or password',
  })
  signInCustomer(
    @Body() signInCustomerDto: SignInUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.usersService.signInCustomer(signInCustomerDto, res);
  }

  @Post('customer')
  @ApiOperation({ summary: 'Register a new customer' })
  @ApiResponse({ status: 201, description: 'Customer successfully registered' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  signUpCustomer(@Body() createUserDto: CreateUserDto) {
    return this.usersService.signUpCustomer(createUserDto);
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
    description: 'Invalid email or password',
    schema: {
      example: {
        message: 'Invalid credentials',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  signInUser(
    @Body() signInUserDto: SignInUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.usersService.signInUser(signInUserDto, res);
  }
}
