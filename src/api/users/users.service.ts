import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity) private readonly userRepo: UsersRepo,
    private readonly bcrypt: BcryptService,
    private readonly jwt: TokenService,
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
          phone_number: config.SUPERADMIN_PHONE_NUMBER,
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
      const { phone_number, password } = createUserDto;

      const existsUser = await this.userRepo.findOne({
        where: { phone_number },
      });

      if (existsUser) {
        throw new ConflictException(
          `User with phone number ${phone_number} already exists`,
        );
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
          phone_number: newUser.phone_number,
          role: newUser.role,
        },
        201,
      );
    } catch (error) {
      return errorCatch(error);
    }
  }

  async signInUser(signInUserDto: SignInUserDto, res: Response) {
    try {
      const { phone_number, password } = signInUserDto;

      const user = await this.userRepo.findOne({
        where: { phone_number },
      });

      if (!user) {
        throw new BadRequestException(`Phone number or password incorrect`);
      }

      if (user.status === Status.INACTIVE) {
        throw new BadRequestException(`You have been blocked by superadmin`);
      }

      const matchPassword = await this.bcrypt.compare(password, user.password);

      if (!matchPassword) {
        throw new BadRequestException(`Phone number or password incorrect`);
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

  
}
