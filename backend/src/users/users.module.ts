import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule

@Module({
  imports: [PrismaModule], // Import PrismaModule so PrismaService is available
  controllers: [UsersController],
  providers: [UsersService], // UsersService will now be able to inject PrismaService
})
export class UsersModule {}
