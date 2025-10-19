import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { errorCatch } from 'src/infrastructure/exception';

export const GetCookie = createParamDecorator(
  async (key: string, ctx: ExecutionContext): Promise<string> => {
    try {
      const req = ctx.switchToHttp().getRequest();
      const refreshToken = req.cookies[key];
      if (!refreshToken) {
        throw new UnauthorizedException(`Refresh token expired`);
      }
      return refreshToken;
    } catch (e) {
      return errorCatch(e);
    }
  },
);
