import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import {
  ActivityAction,
  ActivityEntityType,
} from '../activity-log/activity-log.constants';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { ListCustomersQueryDto } from './dto/list-customers-query.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

const customerSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  organizationId: true,
  assignedToId: true,
  createdAt: true,
  updatedAt: true,
  assignedTo: {
    select: { id: true, name: true, email: true },
  },
} satisfies Prisma.CustomerSelect;

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLog: ActivityLogService,
  ) {}

  private activeWhere(
    organizationId: string,
  ): Prisma.CustomerWhereInput {
    return {
      organizationId,
      deletedAt: null,
    };
  }

  private buildSearchFilter(
    search: string | undefined,
  ): Prisma.CustomerWhereInput | undefined {
    if (!search?.trim()) {
      return undefined;
    }
    const term = search.trim();
    return {
      OR: [
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ],
    };
  }

  async findAll(currentUser: AuthenticatedUser, query: ListCustomersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {
      ...this.activeWhere(currentUser.organizationId),
      ...this.buildSearchFilter(query.search),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.customer.count({ where }),
      this.prisma.customer.findMany({
        where,
        select: customerSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(currentUser: AuthenticatedUser, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: {
        id,
        ...this.activeWhere(currentUser.organizationId),
      },
      select: customerSelect,
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async create(currentUser: AuthenticatedUser, dto: CreateCustomerDto) {
    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          organizationId: currentUser.organizationId,
        },
        select: customerSelect,
      });

      await this.activityLog.log(
        {
          entityType: ActivityEntityType.CUSTOMER,
          entityId: customer.id,
          action: ActivityAction.CUSTOMER_CREATED,
          performedBy: currentUser.id,
          organizationId: currentUser.organizationId,
        },
        tx,
      );

      return customer;
    });
  }

  async update(
    currentUser: AuthenticatedUser,
    id: string,
    dto: UpdateCustomerDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.customer.updateMany({
        where: {
          id,
          ...this.activeWhere(currentUser.organizationId),
        },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.email !== undefined && { email: dto.email }),
          ...(dto.phone !== undefined && { phone: dto.phone }),
        },
      });

      if (updated.count === 0) {
        throw new NotFoundException('Customer not found');
      }

      const customer = await tx.customer.findFirstOrThrow({
        where: { id },
        select: customerSelect,
      });

      await this.activityLog.log(
        {
          entityType: ActivityEntityType.CUSTOMER,
          entityId: customer.id,
          action: ActivityAction.CUSTOMER_UPDATED,
          performedBy: currentUser.id,
          organizationId: currentUser.organizationId,
        },
        tx,
      );

      return customer;
    });
  }

  async softDelete(currentUser: AuthenticatedUser, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const deleted = await tx.customer.updateMany({
        where: {
          id,
          ...this.activeWhere(currentUser.organizationId),
        },
        data: { deletedAt: new Date() },
      });

      if (deleted.count === 0) {
        throw new NotFoundException('Customer not found');
      }

      await this.activityLog.log(
        {
          entityType: ActivityEntityType.CUSTOMER,
          entityId: id,
          action: ActivityAction.CUSTOMER_DELETED,
          performedBy: currentUser.id,
          organizationId: currentUser.organizationId,
        },
        tx,
      );

      return { message: 'Customer deleted', id };
    });
  }

  async restore(currentUser: AuthenticatedUser, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: {
        id,
        organizationId: currentUser.organizationId,
        deletedAt: { not: null },
      },
    });

    if (!customer) {
      throw new NotFoundException('Deleted customer not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const restoredCount = await tx.customer.updateMany({
        where: {
          id,
          organizationId: currentUser.organizationId,
          deletedAt: { not: null },
        },
        data: { deletedAt: null },
      });

      if (restoredCount.count === 0) {
        throw new NotFoundException('Deleted customer not found');
      }

      const restored = await tx.customer.findFirstOrThrow({
        where: { id },
        select: customerSelect,
      });

      await this.activityLog.log(
        {
          entityType: ActivityEntityType.CUSTOMER,
          entityId: restored.id,
          action: ActivityAction.CUSTOMER_RESTORED,
          performedBy: currentUser.id,
          organizationId: currentUser.organizationId,
        },
        tx,
      );

      return restored;
    });
  }

}
