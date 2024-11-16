import { Module } from '@nestjs/common';
import { PeminjamanController } from './peminjaman.controller';
import { PeminjamanService } from './peminjaman.service';
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule

@Module({
  imports: [PrismaModule], // Import PrismaModule so PrismaService is available

  controllers: [PeminjamanController],
  providers: [PeminjamanService]
})
export class PeminjamanModule {}
