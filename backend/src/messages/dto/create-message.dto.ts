import { IsString, IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  receiverId: string;

  @IsString()
  content: string;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;
}

