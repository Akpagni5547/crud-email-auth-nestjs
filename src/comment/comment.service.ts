import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createCommentDto: CreateCommentDto, userId: number) {
    const post = await this.prismaService.post.findUnique({
      where: { id: createCommentDto.postId },
    });
    if (!post) throw new NotFoundException("Le post n'existe pas");
    await this.prismaService.comment.create({
      data: { ...createCommentDto, userId },
    });
    return { data: 'Votre commentaire a été crée avec success' };
  }

  async findAll(postId: number) {
    return await this.prismaService.comment.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            password: false,
          },
        },
        post: {
          select: {
            title: true,
            content: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const comment = await this.prismaService.comment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            password: false,
          },
        },
        post: {
          select: {
            title: true,
            content: true,
          },
        },
      },
    });
    if (!comment) throw new NotFoundException("Le comment n'existe pas");
    return { data: comment };
  }

  async update(id: number, updateCommentDto: UpdateCommentDto, userId: number) {
    const { content } = updateCommentDto;
    const comment = await this.prismaService.comment.findUnique({
      where: { id },
    });
    if (!comment) throw new NotFoundException("Le comment n'existe pas");
    if (comment.userId !== userId)
      throw new UnauthorizedException(
        "Vous n'avez pas le droit de modfier ce commentaire",
      );
    await this.prismaService.comment.update({
      where: { id },
      data: { content },
    });
    return { data: 'Votre commentaire a été modifié avec success' };
  }

  async remove(id: number, userId: number) {
    const comment = await this.prismaService.comment.findUnique({
      where: { id },
    });
    if (!comment) throw new NotFoundException("Le comment n'existe pas");
    if (comment.userId !== userId)
      throw new UnauthorizedException(
        "Vous n'avez pas le droit de supprimer ce comment",
      );
    console.log('ssss');
    await this.prismaService.post.delete({ where: { id } });
    return { data: 'Le comment a ete supprime' };
  }
}
