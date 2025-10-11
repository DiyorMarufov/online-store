import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { errorCatch } from 'src/infrastructure/exception';
import { TokenService } from 'src/infrastructure/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: TokenService) {}

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
      req.user = user;
      return true;
    } catch (error) {
      return errorCatch(error);
    }
  }
}
