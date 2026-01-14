import { IsString, IsNumber, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  creatorId?: string;

  @IsString()
  postId?: string;

  @IsString()
  messageId?: string;

  @IsNumber()
  @Min(0)
  amount?: number;
}

