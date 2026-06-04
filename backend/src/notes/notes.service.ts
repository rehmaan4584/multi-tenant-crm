import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ActivityAction,
  ActivityEntityType,
} from '../activity-log/activity-log.constants';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';

const noteSelect = {
  id: true,
  content: true,
  customerId: true,
  organizationId: true,
  createdById: true,
  createdAt: true,
  createdBy: {
    select: { id: true, name: true, email: true },
  },
} as const;

@Injectable()
export class NotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLog: ActivityLogService,
  ) {}

  async findByCustomer(currentUser: AuthenticatedUser, customerId: string) {
    await this.ensureActiveCustomerInOrg(
      currentUser.organizationId,
      customerId,
    );

    return this.prisma.note.findMany({
      where: {
        customerId,
        organizationId: currentUser.organizationId,
      },
      select: noteSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    currentUser: AuthenticatedUser,
    customerId: string,
    dto: CreateNoteDto,
  ) {
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: customerId,
        organizationId: currentUser.organizationId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const note = await tx.note.create({
        data: {
          content: dto.content,
          customerId,
          organizationId: currentUser.organizationId,
          createdById: currentUser.id,
        },
        select: noteSelect,
      });

      await this.activityLog.log(
        {
          entityType: ActivityEntityType.CUSTOMER,
          entityId: customerId,
          action: ActivityAction.NOTE_ADDED,
          performedBy: currentUser.id,
          organizationId: currentUser.organizationId,
        },
        tx,
      );

      return note;
    });
  }

  private async ensureActiveCustomerInOrg(
    organizationId: string,
    customerId: string,
  ) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, organizationId, deletedAt: null },
      select: { id: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }
}
