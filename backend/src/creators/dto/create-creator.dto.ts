import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CreateCreatorDto {
  @IsNumber()
  @Min(0)
  subscriptionFee: number;

  @IsString()
  @IsOptional()
  bio?: string;
}

