import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createCommentDto: CreateCommentDto, @Req() request: Request) {
    const userId = request.user['id'];
    return this.commentService.create(createCommentDto, userId);
  }

  @Get('post/:id')
  findAll(@Param('id') id: string) {
    return this.commentService.findAll(+id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() request: Request,
  ) {
    const userId = request.user['id'];
    return this.commentService.update(+id, updateCommentDto, userId);
  }
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: Request) {
    const userId = request.user['id'];
    return this.commentService.remove(+id, userId);
  }
}
