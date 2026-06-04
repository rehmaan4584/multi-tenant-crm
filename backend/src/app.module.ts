import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ActivityLogModule,
    AuthModule,
    UsersModule,
    CustomersModule,
  ],
})
export class AppModule {}
