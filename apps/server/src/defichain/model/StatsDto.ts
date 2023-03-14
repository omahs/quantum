import { IsDateString, IsOptional } from 'class-validator';

export class StatsDto {
  @IsDateString()
  @IsOptional()
  date?: string;
}
