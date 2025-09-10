// src/posts/posts.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private readonly postModel: Model<Post>) {}

  // Create a new post; slug must be unique, author provided by controller
  async create(dto: CreatePostDto & { author: string }) {
    // Simple unique check for slug
    const exists = await this.postModel.exists({ slug: dto.slug });
    if (exists) throw new ConflictException('Slug already exists');
    const post = await this.postModel.create(dto);
    return post.toObject();
  }

  // List posts with filters, pagination, and optional search
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
    if (params.author && Types.ObjectId.isValid(params.author))
      filter.author = new Types.ObjectId(params.author);
    if (params.published === 'true') filter.published = true;
    if (params.published === 'false') filter.published = false;

    const hasQuery = Boolean(params.q && params.q.trim());
    if (hasQuery) {
      // Prefer $text if index exists; regex fallback could be added if needed
      filter.$text = { $search: params.q!.trim() };
    }

    const projection = hasQuery ? { score: { $meta: 'textScore' } } : undefined;
    const sort = hasQuery ? { score: { $meta: 'textScore' } } : { createdAt: -1 };

    const [items, total] = await Promise.all([
      this.postModel
        .find(filter, projection)
        .sort(sort as any)
        .skip(skip)
        .limit(limit)
        .select('title slug content tags author published createdAt')
        .populate('author', 'name email')
        .lean(),
      this.postModel.countDocuments(filter),
    ]);

    return {
      page,
      limit,
      total,
      items,
    };
  }

  // Get one by id
  async findOneById(id: Types.ObjectId) {
    const post = await this.postModel.findById(id).populate('author', 'name email').lean();
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  // Get one by slug
  async findOneBySlug(slug: string) {
    const post = await this.postModel.findOne({ slug }).populate('author', 'name email').lean();
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  // Update only by owner
  async update(id: Types.ObjectId, dto: UpdatePostDto, userId: string) {
    const existing = await this.postModel.findById(id).select('author').lean();
    if (!existing) throw new NotFoundException('Post not found');
    if (existing.author?.toString() !== userId) throw new ForbiddenException('Not allowed');

    const updated = await this.postModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('author', 'name email')
      .lean();
    if (!updated) throw new NotFoundException('Post not found');
    return updated;
  }

  // Delete only by owner
  async remove(id: Types.ObjectId, userId: string) {
    const existing = await this.postModel.findById(id).select('author').lean();
    if (!existing) throw new NotFoundException('Post not found');
    if (existing.author?.toString() !== userId) throw new ForbiddenException('Not allowed');

    const res = await this.postModel.findByIdAndDelete(id).lean();
    if (!res) throw new NotFoundException('Post not found');
    return { deleted: true };
  }
}
