import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
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
import { CustomersService } from './customers.service';
import { AssignCustomerDto } from './dto/assign-customer.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { ListCustomersQueryDto } from './dto/list-customers-query.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('customers')
@ApiBearerAuth('JWT')
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({
    summary: 'List active customers (pagination, search by name/email)',
  })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListCustomersQueryDto,
  ) {
    return this.customersService.findAll(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one active customer' })
  @ApiParam({ name: 'id', format: 'uuid' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.customersService.findOne(user, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create customer in current organization' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCustomerDto,
  ) {
    return this.customersService.create(user, dto);
  }

  @Patch(':id/assign')
  @ApiOperation({
    summary:
      'Assign customer to user (max 5 active assignments, concurrency-safe)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  assign(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: AssignCustomerDto,
  ) {
    return this.customersService.assign(user, id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update customer' })
  @ApiParam({ name: 'id', format: 'uuid' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(user, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete customer' })
  @ApiParam({ name: 'id', format: 'uuid' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.customersService.softDelete(user, id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore soft-deleted customer' })
  @ApiParam({ name: 'id', format: 'uuid' })
  restore(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.customersService.restore(user, id);
  }
}
