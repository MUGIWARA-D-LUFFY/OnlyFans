import { IsString, IsBoolean, IsNumber, IsOptional, IsIn, Min } from 'class-validator';

export class UpdatePostDto {
    @IsString()
    @IsOptional()
    title?: string;

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
