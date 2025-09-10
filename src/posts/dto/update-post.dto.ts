// src/posts/dto/update-post.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';

// Update allows partial updates of post fields (author is controlled by server)
export class UpdatePostDto extends PartialType(CreatePostDto) {}
