import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class DeleteServerDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  id: string;
}
