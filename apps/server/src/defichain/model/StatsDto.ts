import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class StatsDto {
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  date?: Date;
}
