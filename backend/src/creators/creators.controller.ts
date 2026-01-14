import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreatorsService } from './creators.service';
import { CreateCreatorDto } from './dto/create-creator.dto';
import { UpdateCreatorDto } from './dto/update-creator.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('creators')
export class CreatorsController {
  constructor(private readonly creatorsService: CreatorsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createCreator(@Request() req, @Body() createCreatorDto: CreateCreatorDto) {
    return this.creatorsService.createCreator(req.user.id, createCreatorDto);
  }

  @Get()
  async getAllCreators() {
    return this.creatorsService.getAllCreators();
  }

  @Get(':id')
  async getCreatorProfile(@Param('id') id: string) {
    return this.creatorsService.getCreatorProfile(id);
  }

  @Get('username/:username')
  async getCreatorByUsername(@Param('username') username: string) {
    return this.creatorsService.getCreatorByUsername(username);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateCreator(@Request() req, @Body() updateCreatorDto: UpdateCreatorDto) {
    return this.creatorsService.updateCreator(req.user.id, updateCreatorDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id/verify')
  async verifyCreator(@Param('id') id: string) {
    return this.creatorsService.verifyCreator(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/earnings')
  async getEarnings(@Param('id') id: string, @Request() req) {
    return this.creatorsService.getEarnings(id, req.user.id);
  }
}

