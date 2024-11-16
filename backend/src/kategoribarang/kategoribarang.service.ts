import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class KategoribarangService {
  constructor(private readonly prisma: PrismaService) {}

  // Get all categories
  async getAllKategori() {
    return await this.prisma.kategoriBarang.findMany();
  }
}
