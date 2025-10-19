import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    try {
      return await this.jwtService.verifyAsync(accessToken, {
        secret: config.ACCESS_TOKEN_KEY,
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Access token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid access token');
      }
      throw new UnauthorizedException('Authentication failed');
    }
  };

  verifyRefreshToken = async (refreshToken: string) => {
    try {
      return this.jwtService.verifyAsync(refreshToken, {
        secret: config.REFRESH_TOKEN_KEY,
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Access token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid access token');
      }
      throw new UnauthorizedException('Authentication failed');
    }
  };
}
