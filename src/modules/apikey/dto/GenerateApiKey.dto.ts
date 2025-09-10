import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class GenerateApiKeyDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  chatbotId: string;
}
