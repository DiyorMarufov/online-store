import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Payload } from 'src/common/interface';
import config from 'src/config';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken = async (payload: Payload) => {
    return this.jwtService.signAsync(payload, {
      secret: config.ACCESS_TOKEN_KEY,
      expiresIn: config.ACCESS_TOKEN_TIME,
    });
  };

  generateRefreshToken = async (payload: Payload) => {
    return this.jwtService.signAsync(payload, {
      secret: config.REFRESH_TOKEN_KEY,
      expiresIn: config.REFRESH_TOKEN_TIME,
    });
  };

  verifyAccessToken = async (accessToken: string) => {
    return this.jwtService.verifyAsync(accessToken, {
      secret: config.ACCESS_TOKEN_KEY,
    });
  };

  verifyRefreshToken = async (refreshToken: string) => {
    return this.jwtService.verifyAsync(refreshToken, {
      secret: config.REFRESH_TOKEN_KEY,
    });
  };
}
