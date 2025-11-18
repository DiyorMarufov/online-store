import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { errorCatch } from 'src/infrastructure/exception';
import { TokenService } from 'src/infrastructure/jwt';
import { Status } from '../../enum';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from 'src/core/entity/users.entity';
import { UsersRepo } from 'src/core/repo/users.repo';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: TokenService,
    @InjectRepository(UsersEntity) private readonly userRepo: UsersRepo,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req = context.switchToHttp().getRequest();
      const auth = req.headers?.authorization;
      if (!auth) {
        throw new UnauthorizedException('Unauthorized');
      }

      const [bearer, token] = auth.split(' ');

      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException('Token not found');
      }

      const user = await this.jwt.verifyAccessToken(token);

      if (!user) {
        throw new UnauthorizedException('Token expired');
      }

      const existsUser = await this.userRepo.findOne({
        where: { id: user?.id },
        select: {
          id: true,
          status: true,
        },
      });

      if (existsUser && existsUser.status === Status.INACTIVE)
        throw new UnauthorizedException('User is blocked');

      req.user = user;
      return true;
    } catch (error) {
      return errorCatch(error);
    }
  }
}
