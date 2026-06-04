import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateNoteDto } from './dto/create-note.dto';
import { NotesService } from './notes.service';

@ApiTags('notes')
@ApiBearerAuth('JWT')
@Controller('customers/:customerId/notes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @ApiOperation({ summary: 'List notes for an active customer' })
  @ApiParam({ name: 'customerId', format: 'uuid' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Param('customerId') customerId: string,
  ) {
    return this.notesService.findByCustomer(user, customerId);
  }

  @Post()
  @ApiOperation({ summary: 'Add note to customer' })
  @ApiParam({ name: 'customerId', format: 'uuid' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('customerId') customerId: string,
    @Body() dto: CreateNoteDto,
  ) {
    return this.notesService.create(user, customerId, dto);
  }
}
