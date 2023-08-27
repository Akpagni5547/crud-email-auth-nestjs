import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createPostDto: CreatePostDto, userId: number) {
    await this.prismaService.post.create({
      data: { ...createPostDto, userId },
    });
    return { data: 'Votre post a été crée avec success' };
  }

  async findAll() {
    return await this.prismaService.post.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true,
            password: false,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                username: true,
                email: true,
                password: false,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const post = await this.prismaService.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            password: false,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                username: true,
                email: true,
                password: false,
              },
            },
          },
        },
      },
    });
    if (!post) throw new NotFoundException("Le post n'existe pas");
    return { data: post };
  }

  async update(id: number, updatePostDto: UpdatePostDto, userId: number) {
    const post = await this.prismaService.post.findUnique({
      where: { id },
    });
    if (!post) throw new NotFoundException("Le post n'existe pas");
    if (post.userId !== userId)
      throw new UnauthorizedException(
        "Vous n'avez pas le droit de modifier ce post",
      );
    await this.prismaService.post.update({
      where: { id },
      data: { ...updatePostDto },
    });
    return { data: 'Le post a ete modifié' };
  }

  async remove(id: number, userId: number) {
    const post = await this.prismaService.post.findUnique({
      where: { id },
    });
    if (!post) throw new NotFoundException("Le post n'existe pas");
    if (post.userId !== userId)
      throw new UnauthorizedException(
        "Vous n'avez pas le droit de supprimer ce post",
      );
    await this.prismaService.post.delete({ where: { id } });
    return { data: 'Le post a ete supprime' };
  }
}
