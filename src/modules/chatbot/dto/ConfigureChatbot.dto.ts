import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ChatbotRole } from 'src/schemas/chatbot';

export class ConfigureChatbotDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @ApiProperty({ enum: ChatbotRole })
  @IsEnum(ChatbotRole)
  @IsNotEmpty()
  role: ChatbotRole;

  @ApiProperty({ default: '', required: false })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ default: '', required: false })
  @IsString()
  @IsOptional()
  size: string;

  @ApiProperty({ default: {}, type: Object })
  @IsObject()
  @IsOptional()
  metadata: Record<string, any>;
}
