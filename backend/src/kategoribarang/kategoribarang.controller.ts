import { Controller, Get } from '@nestjs/common';
import { KategoribarangService } from './kategoribarang.service';

@Controller('api/kategori')
export class KategoribarangController {
  constructor(private readonly kategoriService: KategoribarangService) {}

  // Get all categories
  @Get()
  async getAllKategori() {
    return await this.kategoriService.getAllKategori();
  }
}
