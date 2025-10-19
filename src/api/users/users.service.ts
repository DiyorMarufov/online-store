import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { errorCatch } from 'src/infrastructure/exception';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRepo } from 'src/core/repo/users.repo';
import { UsersEntity } from 'src/core/entity/users.entity';
import { Status, UsersRoles } from 'src/common/enum';
import { BcryptService } from 'src/infrastructure/bcrypt';
import config from 'src/config';
import { successRes } from 'src/infrastructure/successResponse';
import { SignInUserDto } from './dto/sign-in.dto';
import { TokenService } from 'src/infrastructure/jwt';
import { writeToCookie } from 'src/infrastructure/cookie';
import { Response } from 'express';
import { generateOTP } from 'src/infrastructure/otp-generator';
import { ConfirmOtpDto } from './dto/confirm-otp.dto';
import { MailService } from 'src/infrastructure/mail/mail.service';
import { CartEntity } from 'src/core/entity/cart.entity';
import { CartRepo } from 'src/core/repo/cart.repo';
import { WalletsEntity } from 'src/core/entity/wallets.entity';
import { WalletsRepo } from 'src/core/repo/wallets.repo';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity) private readonly userRepo: UsersRepo,
    @InjectRepository(CartEntity) private readonly cartRepo: CartRepo,
    @InjectRepository(WalletsEntity) private readonly walletRepo: WalletsRepo,
    private readonly bcrypt: BcryptService,
    private readonly jwt: TokenService,
    private readonly mailService: MailService,
  ) {}
  async onModuleInit() {
    try {
      const isSuperAdmin = await this.userRepo.findOne({
        where: { role: UsersRoles.SUPERADMIN },
      });

      if (!isSuperAdmin) {
        const hashed_pass = await this.bcrypt.encrypt(
          config.SUPERADMIN_PASSWORD,
        );
        const superAdmin = this.userRepo.create({
          full_name: config.SUPERADMIN_FULL_NAME,
          email: config.SUPERADMIN_EMAIL,
          password: hashed_pass,
          role: UsersRoles.SUPERADMIN,
          is_verified: true,
          status: Status.ACTIVE,
        });
        await this.userRepo.save(superAdmin);
      }
    } catch (error) {
      return errorCatch(error);
    }
  }

  async createUserByRole(createUserDto: CreateUserDto, role: UsersRoles) {
    try {
      const { email, password } = createUserDto;

      const existsUser = await this.userRepo.findOne({
        where: { email },
      });

      if (existsUser) {
        throw new ConflictException(`User with email ${email} already exists`);
      }

      const hashed_pass = await this.bcrypt.encrypt(password);

      const newUser = this.userRepo.create({
        ...createUserDto,
        password: hashed_pass,
        role,
        is_verified: true,
        status: Status.ACTIVE,
      });

      await this.userRepo.save(newUser);

      return successRes(
        {
          full_name: newUser.full_name,
          email: newUser.email,
          role: newUser.role,
        },
        201,
      );
    } catch (error) {
      return errorCatch(error);
    }
  }

  async signUpCustomer(createUserDto: CreateUserDto) {
    try {
      const { email, password } = createUserDto;
      const existsEmail = await this.userRepo.findOne({
        where: { email },
      });

      if (existsEmail) {
        throw new ConflictException(`User with email ${email} already exists`);
      }

      const otp = generateOTP();
      await this.mailService.sendOtp(email, 'Otp', otp);
      const hashed_pass = await this.bcrypt.encrypt(password);

      const newCustomer = this.userRepo.create({
        ...createUserDto,
        password: hashed_pass,
        role: UsersRoles.CUSTOMER,
        otp,
      });

      await this.userRepo.save(newCustomer);

      const newCart = this.cartRepo.create({
        customer: newCustomer,
      });
      await this.cartRepo.save(newCart);

      return successRes(
        {
          full_name: newCustomer.full_name,
          email: newCustomer.email,
        },
        201,
        `You signed up successfully and otp sent to ${email} email`,
      );
    } catch (error) {
      return errorCatch(error);
    }
  }

  async confirmOtpCustomer(confirmOtpDto: ConfirmOtpDto) {
    try {
      const { email, otp } = confirmOtpDto;
      const existsEmail = await this.userRepo.findOne({
        where: { email },
      });

      if (!existsEmail) {
        throw new BadRequestException(`Email is incorrect`);
      }

      if (existsEmail.otp !== otp) {
        throw new BadRequestException(`Otp incorrect`);
      }

      await this.userRepo.update(existsEmail.id, {
        is_verified: true,
      });

      return successRes({}, 200, 'You verified successfully');
    } catch (error) {
      return errorCatch(error);
    }
  }

  async signInCustomer(signInCustomerDto: SignInUserDto, res: Response) {
    try {
      const { email, password } = signInCustomerDto;

      const user = await this.userRepo.findOne({
        where: { email },
      });

      if (!user) {
        throw new BadRequestException(`Email or password incorrect`);
      }

      if (user.status === Status.INACTIVE) {
        throw new BadRequestException(`You have been blocked by superadmin`);
      }

      const matchPassword = await this.bcrypt.compare(password, user.password);

      if (!matchPassword) {
        throw new BadRequestException(`Email or password incorrect`);
      }

      if (!user.is_verified) {
        throw new BadRequestException(`Please first verify your account`);
      }

      const { id, role } = user;
      const payload = { id, role };
      const accessToken = await this.jwt.generateAccessToken(payload);
      const refreshToken = await this.jwt.generateRefreshToken(payload);

      writeToCookie(res, refreshToken, `refreshTokenCustomer`);
      return successRes({
        accessToken,
        refreshToken,
      });
    } catch (error) {
      return errorCatch(error);
    }
  }

  async signInUser(signInUserDto: SignInUserDto, res: Response) {
    try {
      const { email, password } = signInUserDto;

      const user = await this.userRepo.findOne({
        where: { email },
      });

      if (!user) {
        throw new BadRequestException(`Email or password incorrect`);
      }

      if (user.status === Status.INACTIVE) {
        throw new BadRequestException(`You have been blocked by superadmin`);
      }

      const matchPassword = await this.bcrypt.compare(password, user.password);

      if (!matchPassword) {
        throw new BadRequestException(`Email or password incorrect`);
      }

      const { id, role } = user;
      const payload = { id, role };
      const accessToken = await this.jwt.generateAccessToken(payload);
      const refreshToken = await this.jwt.generateRefreshToken(payload);

      let cookieNameRole: string;
      switch (role) {
        case UsersRoles.SUPERADMIN:
          cookieNameRole = 'Superadmin';
          break;
        case UsersRoles.ADMIN:
          cookieNameRole = 'Admin';
          break;
        case UsersRoles.MERCHANT:
          cookieNameRole = 'Merchant';
          break;
        case UsersRoles.CUSTOMER:
          cookieNameRole = 'Customer';
          break;
      }
      writeToCookie(res, refreshToken, `refreshToken${cookieNameRole}`);
      return successRes({ accessToken, refreshToken });
    } catch (error) {
      return errorCatch(error);
    }
  }

  async signOutUser(refreshToken: string, res: Response, cookieName: string) {
    try {
      const decodedToken = await this.jwt.verifyRefreshToken(refreshToken);

      if (!decodedToken) {
        throw new UnauthorizedException(`Refresh token expired`);
      }

      const user = await this.userRepo.findOne({
        where: { id: decodedToken?.id },
      });

      if (!user) {
        throw new NotFoundException(
          `User with ID ${decodedToken.id} not found`,
        );
      }

      res.clearCookie(cookieName);
      return successRes({}, 200, 'User signed out successfully');
    } catch (error) {
      console.log(error)
      return errorCatch(error);
    }
  }

  async findAllUsers() {
    try {
      const allUsers = await this.userRepo.find();
      return successRes(allUsers);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async updateUser(updateUserDto: UpdateUserDto, id: number) {
    try {
      const { password, ...rest } = updateUserDto;

      const existsUser = await this.userRepo.findOne({
        where: { id },
      });

      if (!existsUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      let prevPass = existsUser.password;
      if (password) {
        prevPass = await this.bcrypt.encrypt(password);
      }

      await this.userRepo.update(id, {
        ...rest,
        password: prevPass,
      });
      return successRes({}, 200, 'User successfully updated');
    } catch (error) {
      return errorCatch(error);
    }
  }

  async updateUserStatus(updateUserStatusDto: UpdateUserStatusDto, id: number) {
    try {
      const { status } = updateUserStatusDto;
      const existsUser = await this.userRepo.findOne({
        where: { id },
      });

      if (!existsUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      if (existsUser.role === UsersRoles.SUPERADMIN) {
        throw new ForbiddenException(`Can't update superadmin status`);
      }

      await this.userRepo.update(id, {
        status,
      });
      return successRes({}, 200, 'User status successfully updated');
    } catch (error) {
      return errorCatch(error);
    }
  }

  async deleteUser(id: number) {
    try {
      const existsUser = await this.userRepo.findOne({
        where: { id },
      });

      if (!existsUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      if (existsUser.role === UsersRoles.SUPERADMIN) {
        throw new BadRequestException(`Can't delete superadmin`);
      }

      await this.userRepo.delete(id);
      return successRes({}, 200, 'User successfully deleted');
    } catch (error) {
      return errorCatch(error);
    }
  }
}
