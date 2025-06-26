import { ApiProperty } from '@nestjs/swagger'
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator'

export class SearchAccountDto {
  @ApiProperty()
  @IsNotEmpty()
  keyword: string

  @ApiProperty({ required: false })
  @IsMongoId({ message: 'Account ID is invalid' })
  @IsOptional()
  areaId: string
}
