import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        creator: true,
        subscriptions: {
          include: {
            creator: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getProfileByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        creator: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, email, ...publicProfile } = user;
    return publicProfile;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if username is being changed and if it's available
    if (updateProfileDto.username && updateProfileDto.username !== user.username) {
      const existingUser = await this.prisma.user.findUnique({
        where: { username: updateProfileDto.username },
      });

      if (existingUser) {
        throw new BadRequestException('Username already taken');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
}


