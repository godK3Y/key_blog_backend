// src/posts/dto/create-post.dto.ts
import { IsArray, IsBoolean, IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(3)
  slug: string;

  @IsString()
  @MinLength(10)
  content: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @IsMongoId()
  author: string; // userId
}
