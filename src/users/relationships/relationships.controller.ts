import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserId } from 'src/decorators/userId.decorator';
import { CreateRelationshipDto } from './dto/create-relationship.dto';
import {
  UpdateRelationshipDto,
  UpdateRelationshipParamsDto,
} from './dto/update-relationship.dto';
import { MappedRelationship } from './helpers/mapUserRelationships.helper';
import { RelationshipsService } from './relationships.service';
import { DeleteRelationshipParamsDto } from './dto/delete-relationship.dto';

@ApiTags('relationships')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller('me/relationships')
export class RelationshipsController {
  constructor(private readonly relationshipsService: RelationshipsService) {}

  @Get('')
  async getUserRelationships(
    @UserId() userId: string,
  ): Promise<MappedRelationship[]> {
    return this.relationshipsService.get(userId);
  }

  @Post('')
  async createRelationshipInvite(
    @UserId() userId: string,
    @Body() data: CreateRelationshipDto,
  ) {
    return this.relationshipsService.create(userId, data);
  }

  @ApiParam({ name: 'id', type: String })
  @Patch(':id')
  async respondToRelationshipRequest(
    @UserId() userId: string,
    @Param() params: UpdateRelationshipParamsDto,
    @Body() data: UpdateRelationshipDto,
  ) {
    return this.relationshipsService.respond(userId, params.id, data);
  }

  @ApiParam({ name: 'id', type: String })
  @Delete(':id')
  async deleteRelationship(
    @UserId() userId: string,
    @Param() params: DeleteRelationshipParamsDto,
  ) {
    return this.relationshipsService.delete(userId, params.id);
  }
}
