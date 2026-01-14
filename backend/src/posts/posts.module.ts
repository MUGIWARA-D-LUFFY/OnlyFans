import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { LikesService } from './likes.service';
import { CommentsService } from './comments.service';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [SubscriptionsModule],
  controllers: [PostsController],
  providers: [PostsService, LikesService, CommentsService],
  exports: [PostsService, LikesService, CommentsService],
})
export class PostsModule { }
