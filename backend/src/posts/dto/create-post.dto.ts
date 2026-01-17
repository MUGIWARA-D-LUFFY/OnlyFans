import { IsString, IsBoolean, IsNumber, IsOptional, IsIn, Min } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  mediaUrl: string;

  @IsString()
  @IsIn(['image', 'video'])
  mediaType: string;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  @IsIn(['PUBLIC', 'SUBSCRIBERS', 'PAID'])
  visibility?: 'PUBLIC' | 'SUBSCRIBERS' | 'PAID';
}

