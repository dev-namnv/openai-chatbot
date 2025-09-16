import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { SortOrder } from 'mongoose';

class Search {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  field: string;

  @ApiProperty()
  @IsNotEmpty()
  value: string | number | boolean;
}

class Sort {
  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  field: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsIn([-1, 1, 'asc', 'ascending', 'desc', 'descending'])
  @IsNotEmpty()
  order: SortOrder;
}

export class PaginationDto {
  @ApiProperty({ required: false, default: 1 })
  @Type(() => Number)
  @Min(1)
  @IsInt()
  @IsOptional()
  page: number;

  @ApiProperty({ required: false, default: 5 })
  @Type(() => Number)
  @Min(1)
  @Max(100)
  @IsInt()
  @IsOptional()
  limit: number;

  @ApiProperty({ required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Search)
  @IsOptional()
  search?: Search[];

  @ApiProperty({ required: false })
  @Type(() => Sort)
  @IsOptional()
  sort?: Sort;
}
