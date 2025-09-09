import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class TrainingDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  chatbotId: string;

  @ApiProperty({ type: [String] })
  //   @Transform(({ value }) =>
  //     Array.isArray(value) ? value.map((text) => text.trim()) : [],
  //   )
  @IsArray()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @IsNotEmpty({ each: true })
  texts: string[];
}
