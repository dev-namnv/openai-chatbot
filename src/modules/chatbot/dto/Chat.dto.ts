import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChatDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  chatbotId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty()
  @IsMongoId()
  @IsOptional()
  chatId: string;
}
