import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../user/schemas/user.schema';
import { Post } from '../posts/schemas/post.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userModel = app.get<Model<User>>(getModelToken('User'));
    const postModel = app.get<Model<Post>>(getModelToken('Post'));

    // Ensure demo user exists
    const email = 'demo@example.com';
    let user = await userModel.findOne({ email }).exec();
    if (!user) {
      user = await userModel.create({
        name: 'Demo User',
        email,
        password: 'password123', // Will be hashed by pre-save hook
      } as any);
      console.log('Created demo user:', user.email);
    } else {
      console.log('Demo user already exists:', user.email);
    }

    const authorId = (user as any)._id as Types.ObjectId;

    const posts = [
      {
        title: 'Welcome to the Blog',
        slug: 'welcome-to-the-blog',
        content: 'This is the first post in our blog. Stay tuned for updates!'.repeat(3),
        tags: ['welcome', 'intro'],
        published: true,
        author: authorId,
      },
      {
        title: 'NestJS + MongoDB Best Practices',
        slug: 'nestjs-mongodb-best-practices',
        content:
          'We cover schema design, indexes, and performance tips for MongoDB with NestJS.'.repeat(
            3,
          ),
        tags: ['nestjs', 'mongodb', 'best-practices'],
        published: true,
        author: authorId,
      },
      {
        title: 'Draft: Upcoming Features',
        slug: 'draft-upcoming-features',
        content: 'A sneak peek into what we are building next...'.repeat(3),
        tags: ['draft', 'roadmap'],
        published: false,
        author: authorId,
      },
      {
        title: 'Working with JWT Cookies',
        slug: 'working-with-jwt-cookies',
        content: 'Learn how to secure your app using HttpOnly cookies carrying JWTs.'.repeat(3),
        tags: ['auth', 'jwt', 'cookies'],
        published: true,
        author: authorId,
      },
      {
        title: 'Full-Text Search Setup',
        slug: 'full-text-search-setup',
        content: 'Enable text indexes and query using $text for better search ranking.'.repeat(3),
        tags: ['search', 'mongodb'],
        published: true,
        author: authorId,
      },
    ];

    // Insert posts if not existing by slug
    for (const p of posts) {
      const exists = await postModel.exists({ slug: p.slug });
      if (!exists) {
        await postModel.create(p as any);
        console.log('Inserted post:', p.slug);
      } else {
        console.log('Post already exists, skipping:', p.slug);
      }
    }
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await app.close();
  }
}

bootstrap();
