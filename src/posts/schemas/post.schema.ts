// src/posts/schemas/post.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: false })
  published: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;
}
export const PostSchema = SchemaFactory.createForClass(Post);
