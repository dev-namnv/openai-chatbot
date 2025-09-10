import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DimensionSize } from 'src/modules/pinecone/pinecone.service';
import { ChatbotType } from 'src/schemas/chatbot';

export class ConfigureChatbotDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @ApiProperty({ enum: ChatbotType })
  @IsEnum(ChatbotType)
  @IsNotEmpty()
  type: ChatbotType;

  @ApiProperty()
  @MaxLength(32)
  @MinLength(2)
  @IsNotEmpty()
  role: string;

  @ApiProperty({ default: '', required: false })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ required: false })
  @IsEnum(DimensionSize)
  @IsOptional()
  size: DimensionSize;

  @ApiProperty({ default: {}, type: Object })
  @IsObject()
  @IsOptional()
  metadata: Record<string, any>;
}
