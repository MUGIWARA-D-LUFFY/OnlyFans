import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class UpdateCreatorDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  subscriptionFee?: number;

  @IsString()
  @IsOptional()
  bio?: string;
}

