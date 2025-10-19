import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersRoles } from '../enum';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRepo } from 'src/core/repo/users.repo';
import { UsersEntity } from 'src/core/entity/users.entity';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(@InjectRepository(UsersEntity) private userRepo: UsersRepo) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const { user, params } = ctx.switchToHttp().getRequest();
    const targetUser = await this.userRepo.findOne({
      where: { id: +params.id },
    });

    if (!targetUser) {
      throw new NotFoundException(`Target user with ID ${params.id} not found`);
    }

    if (user.role === UsersRoles.SUPERADMIN) {
      return true;
    }

    if (user.role === UsersRoles.ADMIN) {
      if (user.id === +params.id) return true;
      if (
        targetUser.role === UsersRoles.CUSTOMER ||
        targetUser.role === UsersRoles.MERCHANT
      ) {
        return true;
      }
      throw new ForbiddenException(`Admin can't update another admin`);
    }

    if (
      (user.role === UsersRoles.MERCHANT ||
        user.role === UsersRoles.CUSTOMER) &&
      user.id === +params.id
    ) {
      return true;
    }

    throw new ForbiddenException(`Forbidden user with role ${user.role}`);
  }
}
