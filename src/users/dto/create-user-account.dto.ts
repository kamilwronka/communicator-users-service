import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
class Auth0User {
  @ApiProperty({
    description: 'user email',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Auth0User)
  user: Auth0User;
}
