import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { RelationshipStatus } from '../entities/relationship.entity';

export enum ERespondToRelationshipStatuses {
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

export class RespondToRelationshipInviteDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(RelationshipStatus)
  status: RelationshipStatus;
}
