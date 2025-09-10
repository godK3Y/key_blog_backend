// src/posts/posts.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ParseObjectIdPipe } from '../common/pipes/objectid.pipe';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // Create a new post; author is taken from JWT cookie
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() dto: CreatePostDto) {
    return this.postsService.create({ ...dto, author: req.user.userId });
  }

  // Public list with filters, pagination, and optional search
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

  // Find a post by slug
  @Get('slug/:slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.postsService.findOneBySlug(slug);
  }

  // Find a post by id
  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.postsService.findOneById(id);
  }

  // Update a post; only author can update
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Req() req: any,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, dto, req.user.userId);
  }

  // Delete a post; only author can delete
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Req() req: any, @Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.postsService.remove(id, req.user.userId);
  }
}
