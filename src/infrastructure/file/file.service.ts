import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, unlink, writeFile } from 'fs';
import { extname, join, resolve } from 'path';
import config from 'src/config';
import { v4 } from 'uuid';
import { errorCatch } from '../exception';

@Injectable()
export class FileService {
  private readonly baseUrl = config.BASE_URL;
  private readonly filePath = resolve(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    'uploads',
  );

  async createFile(file: Express.Multer.File): Promise<string> {
    try {
      const ext = extname(file.originalname);
      const fileName = `${file.originalname.split('.')[0]}_${v4()}${ext}`;

      if (!existsSync(this.filePath)) {
        mkdirSync(this.filePath, { recursive: true });
      }
      await new Promise<void>((res, rej) => {
        writeFile(join(this.filePath, fileName), file.buffer, (e) => {
          if (e) rej(e);
          res();
        });
      });

      return `${this.baseUrl}${fileName}`;
    } catch (e) {
      return errorCatch(e);
    }
  }

  async deleteFile(fileName: string) {
    try {
      fileName = fileName.split(config.BASE_URL)[1];
      const file = resolve(this.filePath, fileName);
      if (!existsSync(file)) {
        throw new BadRequestException(`File does not exist: ${fileName}`);
      }
      await new Promise<void>((res, rej) => {
        unlink(file, (err) => {
          if (err) rej(err);
          res();
        });
      });
    } catch (e) {
      return errorCatch(e);
    }
  }

  async existsFile(fileName: string): Promise<boolean> {
    try {
      if (!fileName) {
        return false;
      }
      fileName = fileName.split(config.BASE_URL)[1];
      const file = resolve(this.filePath, fileName);

      if (existsSync(file)) {
        return true;
      }
      return false;
    } catch (e) {
      return errorCatch(e);
    }
  }
}
