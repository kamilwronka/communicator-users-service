import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class GetUserByIdParamsDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  id: string;
}
