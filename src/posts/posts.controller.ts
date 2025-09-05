// src/posts/posts.controller.ts
import { Controller, Get, Post, Body, Param, Query, Put, Delete } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ParseObjectIdPipe } from '../common/pipes/objectid.pipe';
import { Types } from 'mongoose';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() dto: CreatePostDto) {
    return this.postsService.create(dto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('tag') tag?: string,
    @Query('author') author?: string,
    @Query('published') published?: 'true' | 'false',
    @Query('q') q?: string,
  ) {
    return this.postsService.findAll({
      page: Number(page),
      limit: Number(limit),
      tag,
      author,
      published,
      q,
    });
  }

  @Get('slug/:slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.postsService.findOneBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.postsService.findOneById(id);
  }

  @Put(':id')
  update(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Body() dto: UpdatePostDto) {
    return this.postsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.postsService.remove(id);
  }
}
