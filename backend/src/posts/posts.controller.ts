import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { LikesService } from './likes.service';
import { CommentsService } from './comments.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly likesService: LikesService,
    private readonly commentsService: CommentsService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @Post('creator/:creatorId')
  async createPost(
    @Param('creatorId') creatorId: string,
    @Request() req,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.createPost(creatorId, req.user.id, createPostDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('feed')
  async getFeed(@Request() req, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.postsService.getFeed(
      req.user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Public()
  @Get(':id')
  async getPost(@Param('id') id: string, @Request() req) {
    return this.postsService.getPost(id, req.user?.id);
  }

  @Public()
  @Get('creator/:creatorId')
  async getCreatorPosts(
    @Param('creatorId') creatorId: string,
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.postsService.getCreatorPosts(
      creatorId,
      req.user?.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePost(@Param('id') id: string, @Request() req) {
    return this.postsService.deletePost(id, req.user.id);
  }

  // ============ LIKES ============

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async likePost(@Param('id') postId: string, @Request() req) {
    return this.likesService.likePost(req.user.id, postId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/like')
  async unlikePost(@Param('id') postId: string, @Request() req) {
    return this.likesService.unlikePost(req.user.id, postId);
  }

  @Public()
  @Get(':id/likes')
  async getLikeStatus(@Param('id') postId: string, @Request() req) {
    const count = await this.likesService.getLikeCount(postId);
    const isLiked = req.user?.id ? await this.likesService.isLiked(req.user.id, postId) : false;
    return { count, isLiked };
  }

  // ============ COMMENTS ============

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async createComment(
    @Param('id') postId: string,
    @Request() req,
    @Body() body: { content: string },
  ) {
    return this.commentsService.createComment(req.user.id, postId, body.content);
  }

  @Public()
  @Get(':id/comments')
  async getComments(
    @Param('id') postId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.commentsService.getComments(
      postId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comments/:commentId')
  async deleteComment(@Param('commentId') commentId: string, @Request() req) {
    return this.commentsService.deleteComment(commentId, req.user.id);
  }
}
