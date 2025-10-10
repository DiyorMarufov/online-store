import { Injectable } from '@nestjs/common';
import { hash, compare } from 'bcrypt';
import { errorCatch } from '../exception';

const salt = 10;
@Injectable()
export class BcryptService {
  async encrypt(password: string) {
    try {
      return await hash(password, salt);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async compare(password: string, hash: string) {
    try {
      return await compare(password, hash);
    } catch (error) {
      return errorCatch(error);
    }
  }
}
