import { Type } from 'class-transformer';
import { IsEmail, IsISO8601, IsString, ValidateNested } from 'class-validator';

class Auth0UserData {
  @IsString()
  user_id: string;

  @IsEmail()
  email: string;

  @IsISO8601()
  @IsString()
  created_at: string;
}

export class CreateUserAccountDto {
  @ValidateNested()
  @Type(() => Auth0UserData)
  user: Auth0UserData;
}
