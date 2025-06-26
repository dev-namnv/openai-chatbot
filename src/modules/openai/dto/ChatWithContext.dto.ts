import { ApiProperty } from '@nestjs/swagger';
import { GPTModel } from '../interfaces/GPTModel';

export class ChatWithContextDto {
  @ApiProperty()
  sessionId?: string;

  @ApiProperty()
  question: string;

  @ApiProperty()
  model?: GPTModel;
}
