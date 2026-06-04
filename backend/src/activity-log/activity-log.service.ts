import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface LogActivityInput {
  entityType: string;
  entityId: string;
  action: string;
  performedBy: string;
  organizationId: string;
}

@Injectable()
export class ActivityLogService {
  constructor(private readonly prisma: PrismaService) {}

  log(
    input: LogActivityInput,
    tx?: Prisma.TransactionClient,
  ): Promise<unknown> {
    const client = tx ?? this.prisma;
    return client.activityLog.create({
      data: {
        entityType: input.entityType,
        entityId: input.entityId,
        action: input.action,
        performedBy: input.performedBy,
        organizationId: input.organizationId,
      },
    });
  }
}
