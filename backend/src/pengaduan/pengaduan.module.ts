import { Module } from '@nestjs/common';
import { PengaduanController } from './pengaduan.controller';
import { PengaduanService } from './pengaduan.service';
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule

@Module({
  imports: [PrismaModule], // Import PrismaModule so PrismaService is available

  controllers: [PengaduanController],
  providers: [PengaduanService]
})
export class PengaduanModule {}
