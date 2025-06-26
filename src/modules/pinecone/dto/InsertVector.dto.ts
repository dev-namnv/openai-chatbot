import { ApiProperty } from '@nestjs/swagger';

export class InsertVectorDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  text: string;
}
