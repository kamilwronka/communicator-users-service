import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserId } from 'src/decorators/userId.decorator';
import { CreateRelationshipDto } from './dto/create-relationship.dto';
import {
  UpdateRelationshipDto,
  UpdateRelationshipParamsDto,
} from './dto/update-relationship.dto';
import { RelationshipsService } from './relationships.service';

@ApiTags('relationships')
@ApiBearerAuth()
@Controller('relationships')
export class RelationshipsController {
  constructor(private readonly relationshipsService: RelationshipsService) {}

  @Get('')
  async getUserRelationships(@UserId() userId: string) {
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
}
