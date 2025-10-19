import {
  Controller,
  Post,
  Body,
  Res,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
  Delete,
  Get,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInUserDto } from './dto/sign-in.dto';
import { Response } from 'express';
import { Status, UserRolesForSignOut, UsersRoles } from 'src/common/enum';
import { ConfirmOtpDto } from './dto/confirm-otp.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { UsersEntity } from 'src/core/entity/users.entity';
import { checkRoles } from 'src/common/decorator/role.decorator';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { UserGuard } from 'src/common/guard/self.guard';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { GetCookie } from 'src/common/decorator/get-cookie.decorator';

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

  @Post('signup/customer')
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

  @Post('signout/:type')
  @ApiOperation({
    summary: 'Sign out user',
    description: 'Signs out the user and clears refresh token cookie',
  })
  @ApiParam({
    name: 'type',
    enum: UserRolesForSignOut,
    description: 'Role type of the user (e.g. Admin, Tenant, Landlord)',
    example: 'Admin',
  })
  @ApiResponse({ status: 200, description: 'User signed out successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - refresh token expired or invalid',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  signOutUser(
    @Param('type') type: UserRolesForSignOut,
    @Res({ passthrough: true }) res: Response,
    @Req() req: any,
  ) {
    const cookieName = `refreshToken${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const refreshToken = Object.keys(req.cookies).find(
      (key) => req.cookies[key] === cookieName,
    );
    return this.usersService.signOutUser(
      refreshToken as string,
      res,
      cookieName,
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all users (only SUPERADMIN)' })
  @ApiResponse({
    status: 200,
    description: 'List of users successfully retrieved',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only SUPERADMIN can access this resource',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Token is missing or invalid',
  })
  @Get()
  findAllUsers() {
    return this.usersService.findAllUsers();
  }

  @UseGuards(AuthGuard, RolesGuard, UserGuard)
  @checkRoles(
    UsersRoles.SUPERADMIN,
    UsersRoles.ADMIN,
    UsersRoles.MERCHANT,
    UsersRoles.CUSTOMER,
  )
  @ApiOperation({ summary: 'Update user by ID (role-based access)' })
  @ApiResponse({ status: 200, description: 'User successfully updated' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have permission',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBearerAuth('access-token')
  @Patch(':id')
  updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.updateUser(updateUserDto, id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN)
  @ApiOperation({ summary: 'Update user status (active/inactive)' })
  @ApiResponse({ status: 200, description: 'User status successfully updated' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only SUPERADMIN can change status',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBearerAuth('access-token')
  @Patch(':id/status')
  updateUserStatus(
    @Body() updateUserStatusDto: UpdateUserStatusDto,
    @Param('id') id: number,
  ) {
    return this.usersService.updateUserStatus(updateUserStatusDto, id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN)
  @ApiOperation({ summary: 'Delete user by ID (only SUPERADMIN)' })
  @ApiResponse({ status: 200, description: 'User successfully deleted' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only SUPERADMIN can delete',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBearerAuth('access-token')
  @Delete(':id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }
}
