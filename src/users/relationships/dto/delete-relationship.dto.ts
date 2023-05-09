import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteRelationshipParamsDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
