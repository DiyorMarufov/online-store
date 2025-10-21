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

  transform(value: any) {
    try {
      if (value?.length) {
        for (const file of value) {
          const ext = extname(file?.originalname).toLowerCase();
          if (!this.allowedExt.includes(ext)) {
            throw new BadRequestException(
              `Only allowed files: ${this.allowedExt.join('. ')}`,
            );
          }
        }
      }
      return value;
    } catch (e) {
      return errorCatch(e);
    }
  }
}
