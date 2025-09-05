// src/common/pipes/objectid.pipe.ts
import { BadRequestException, PipeTransform } from '@nestjs/common';
import { isValidObjectId, Types } from 'mongoose';

export class ParseObjectIdPipe implements PipeTransform<string, Types.ObjectId> {
  transform(value: string) {
    if (!isValidObjectId(value)) {
      throw new BadRequestException('Invalid ObjectId');
    }
    return new Types.ObjectId(value);
  }
}
