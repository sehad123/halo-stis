import { Module } from '@nestjs/common';
import { KategoribarangController } from './kategoribarang.controller';
import { KategoribarangService } from './kategoribarang.service';
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule

@Module({
  imports: [PrismaModule], // Import PrismaModule so PrismaService is available

  controllers: [KategoribarangController],
  providers: [KategoribarangService]
})
export class KategoribarangModule {}
