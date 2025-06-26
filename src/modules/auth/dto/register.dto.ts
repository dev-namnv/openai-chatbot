import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator'

export class RegisterDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'First name cannot be empty' })
  firstName: string

  @ApiProperty()
  @IsNotEmpty({ message: 'Last name cannot be empty' })
  lastName: string

  @ApiProperty()
  @IsEmail(
    {},
    {
      message: 'Email is invalid'
    }
  )
  @IsNotEmpty({ message: 'Email cannot be empty' })
  email: string

  @ApiProperty()
  @Matches(/^[^\s\r\n\t]+$/, {
    message: 'Password contains invalid characters"'
  })
  @MinLength(6, { message: 'Password must be greater than 6 characters' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  password: string
}
