// src/users/users.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto) {
    const exists = await this.userModel.exists({ email: dto.email });
    if (exists) throw new ConflictException('Email already in use');

    // Rely on Mongoose pre-save hook to hash password
    const user = await this.userModel.create({ ...dto });
    const { password, ...safe } = user.toObject(); // ✅ ไม่ใช้ delete
    return safe;
  }

  async findAll() {
    return this.userModel.find().select('-password').lean();
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).select('-password').lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email }).lean();
    if (!user) throw new NotFoundException('User not found');
    delete (user as any).password;
    return user;
  }
  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async update(id: string, dto: UpdateUserDto) {
    const updated = await this.userModel
      .findByIdAndUpdate(id, dto, { new: true })
      .select('-password')
      .lean();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async remove(id: string) {
    const res = await this.userModel.findByIdAndDelete(id).lean();
    if (!res) throw new NotFoundException('User not found');
    return { deleted: true };
  }
}
