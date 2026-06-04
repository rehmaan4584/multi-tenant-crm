import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as pg from 'pg';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor() {
        const connectionString = process.env.DATABASE_URL as string;
        const pool = new pg.Pool({ connectionString });
        const adapter = new PrismaPg(pool);
        super({ adapter });
    }
    async onModuleInit() {
        await this.$connect();
        console.log('Database connected');
    }
    async onModuleDestroy() {
        await this.$disconnect();
        console.log('Database disconnected');
    }
}
