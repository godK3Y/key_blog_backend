import { PartialType } from '@nestjs/mapped-types';
import { createAuthDto } from './create-auth.dto';

export class UpdateAuthDto extends PartialType(createAuthDto) {}
