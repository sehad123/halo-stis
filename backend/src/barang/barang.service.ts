import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BarangService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new barang
  async addBarang(data: {
    name: string;
    kategoriId: number;
    lokasi?: string;
    kondisi?: string;
    photo?: string;
    available?: string;
  }) {
    const { name, kategoriId, lokasi, kondisi, photo, available } = data;

    return this.prisma.barang.create({
      data: {
        name: name || '', // Ensure name is not undefined/null
        kategoriId, // Use the provided kategoriId
        lokasi: lokasi || '', // Default value if lokasi is missing
        kondisi: kondisi || '', // Default value if kondisi is missing
        available: available || '', // Default value if available is missing
        photo: photo || null, // Ensure photo is either a valid path or null
      },
    });
  }

  // Read all barang
  async getAllBarang() {
    return this.prisma.barang.findMany({
      include: { kategori: true }, // Include kategori for detailed response
    });
  }

  // Get available barang
  async getAvailableBarang(kategoriId?: number) {
    const filter: { available: string; kategoriId?: number } = {
      available: 'Ya',
    };

    // Add kategoriId to the filter if provided
    if (kategoriId) {
      filter.kategoriId = kategoriId;
    }

    return this.prisma.barang.findMany({
      where: filter,
      include: { kategori: true }, // Include kategori for detailed response
    });
  }

  // Read a single barang by ID
  async getBarangById(id: number) {
    return this.prisma.barang.findUnique({
      where: { id },
      include: { kategori: true }, // Include kategori for detailed response
    });
  }

  // Update a barang
  async updateBarang(id: number, data: any) {
    return this.prisma.barang.update({
      where: { id },
      data,
    });
  }

  // Delete a barang
  async deleteBarang(id: number) {
    return this.prisma.barang.delete({
      where: { id },
    });
  }
}
