import { Module } from '@nestjs/common';
import { BarangController } from './barang.controller';
import { BarangService } from './barang.service';
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule

@Module({
  imports: [PrismaModule], // Import PrismaModule so PrismaService is available

  controllers: [BarangController],
  providers: [BarangService]
})
export class BarangModule {}
