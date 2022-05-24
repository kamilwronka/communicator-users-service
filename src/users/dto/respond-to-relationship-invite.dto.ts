import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { RelationshipStatus } from '../entities/relationship.entity';

export class RespondToRelationshipInviteDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(RelationshipStatus)
  status: RelationshipStatus;
}
