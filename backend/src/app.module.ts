import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { BarangModule } from './barang/barang.module';
import { KategoribarangModule } from './kategoribarang/kategoribarang.module';
import { PeminjamanModule } from './peminjaman/peminjaman.module';
import { PengaduanModule } from './pengaduan/pengaduan.module';

@Module({
  imports: [PrismaModule, UsersModule, BarangModule, KategoribarangModule, PeminjamanModule, PengaduanModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
