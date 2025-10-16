import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { extname } from 'path';
import { errorCatch } from '../exception';

@Injectable()
export class ImageValidationPipe implements PipeTransform {
  private readonly allowedExt = [
    '.jpeg',
    '.jpg',
    '.png',
    '.svg',
    '.heic',
    '.webp',
  ];

  transform(value: any, _: any) {
    try {
      if (value) {
        const file = value.originalname;
        const ext = extname(file).toLowerCase();
        if (!this.allowedExt.includes(ext)) {
          throw new BadRequestException(
            `Only allowed files: ${this.allowedExt.join('. ')}`,
          );
        }
        return value;
      }
    } catch (e) {
      return errorCatch(e);
    }
  }
}
