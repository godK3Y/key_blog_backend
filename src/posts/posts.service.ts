// src/posts/posts.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private readonly postModel: Model<Post>) {}

  async create(dto: CreatePostDto) {
    // ป้องกัน slug ซ้ำแบบง่าย ๆ
    const exists = await this.postModel.exists({ slug: dto.slug });
    if (exists) throw new NotFoundException('Slug already exists'); // ปรับเป็น ConflictException ก็ได้
    const post = await this.postModel.create(dto);
    return post.toObject();
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    tag?: string;
    author?: string;
    published?: 'true' | 'false';
    q?: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (params.tag) filter.tags = params.tag;
    if (params.author) filter.author = new Types.ObjectId(params.author);
    if (params.published === 'true') filter.published = true;
    if (params.published === 'false') filter.published = false;
    if (params.q)
      filter.$or = [
        { title: { $regex: params.q, $options: 'i' } },
        { content: { $regex: params.q, $options: 'i' } },
        { tags: { $in: [new RegExp(params.q, 'i')] } },
      ];

    const [items, total] = await Promise.all([
      this.postModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email')
        .lean(), // เร็วและได้ plain object
      this.postModel.countDocuments(filter),
    ]);

    return {
      page,
      limit,
      total,
      items,
    };
  }

  async findOneById(id: Types.ObjectId) {
    const post = await this.postModel.findById(id).populate('author', 'name email').lean();
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async findOneBySlug(slug: string) {
    const post = await this.postModel.findOne({ slug }).populate('author', 'name email').lean();
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async update(id: Types.ObjectId, dto: UpdatePostDto) {
    const updated = await this.postModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('author', 'name email')
      .lean();
    if (!updated) throw new NotFoundException('Post not found');
    return updated;
  }

  async remove(id: Types.ObjectId) {
    const res = await this.postModel.findByIdAndDelete(id).lean();
    if (!res) throw new NotFoundException('Post not found');
    return { deleted: true };
  }
}
