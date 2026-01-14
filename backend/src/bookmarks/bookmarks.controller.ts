import { Controller, Get, Post, Delete, Param, Request, UseGuards } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class BookmarksController {
    constructor(private readonly bookmarksService: BookmarksService) { }

    @Get()
    async getBookmarks(@Request() req) {
        return this.bookmarksService.getBookmarks(req.user.id);
    }

    @Post(':postId')
    async addBookmark(@Param('postId') postId: string, @Request() req) {
        return this.bookmarksService.addBookmark(req.user.id, postId);
    }

    @Delete(':postId')
    async removeBookmark(@Param('postId') postId: string, @Request() req) {
        return this.bookmarksService.removeBookmark(req.user.id, postId);
    }

    @Get(':postId/status')
    async isBookmarked(@Param('postId') postId: string, @Request() req) {
        return this.bookmarksService.isBookmarked(req.user.id, postId);
    }
}
