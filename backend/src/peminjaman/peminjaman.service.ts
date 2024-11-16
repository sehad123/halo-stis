import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PeminjamanService {
  constructor(private readonly prisma: PrismaService) {}

  async createPeminjaman(data: {
    userId: number;
    barangId: number;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    keperluan: string;
    nama_kegiatan: string;
    bukti_persetujuan: string;
  }) {
    const { userId, barangId, startDate, endDate, startTime, endTime, keperluan,  nama_kegiatan, bukti_persetujuan } = data;

    return this.prisma.peminjaman.create({
      data: {
        userId,
        barangId: parseInt(barangId.toString(), 10),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startTime,
        endTime,
        keperluan,
        nama_kegiatan,
        bukti_pengembalian: '',
        catatan: '',
        notifikasi: '',
        status: 'PENDING',
        bukti_persetujuan,
      },
    });
  }

  async approvePeminjaman(id: number, catatan: string) {
    return this.prisma.$transaction(async (tx) => {
      const peminjaman = await tx.peminjaman.update({
        where: { id },
        data: { status: 'APPROVED', catatan, notifikasi: 'Ya' },
      });

      if (!peminjaman) {
        throw new HttpException('Peminjaman tidak ditemukan', HttpStatus.NOT_FOUND);
      }

      await tx.barang.update({
        where: { id: peminjaman.barangId },
        data: { available: 'Tidak' },
      });

      return peminjaman;
    });
  }

  async rejectPeminjaman(id: number, catatan: string) {
    const peminjaman = await this.prisma.peminjaman.update({
      where: { id },
      data: { status: 'REJECTED', catatan, notifikasi: 'Ya' },
    });

    if (!peminjaman) {
      throw new HttpException('Peminjaman tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    return peminjaman;
  }

  async pencetNotifikasi(userId: number) {
    const result = await this.prisma.peminjaman.updateMany({
      where: { userId },
      data: { notifikasi: 'Tidak' },
    });

    if (result.count === 0) {
      throw new HttpException('Tidak ada peminjaman yang ditemukan untuk user ini', HttpStatus.NOT_FOUND);
    }

    return result;
  }

  async returnBarang(id: number, buktiPengembalian: string) {
    const peminjaman = await this.prisma.peminjaman.findUnique({
      where: { id },
    });

    if (!peminjaman) {
      throw new HttpException('Peminjaman tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    const updatedPeminjaman = await this.prisma.peminjaman.update({
      where: { id },
      data: {
        status: 'DIKEMBALIKAN',
        bukti_pengembalian: buktiPengembalian,
      },
    });

    await this.prisma.barang.update({
      where: { id: peminjaman.barangId },
      data: { available: 'Ya' },
    });

    return updatedPeminjaman;
  }

  async trackPeminjaman(userId: number) {
    const peminjaman = await this.prisma.peminjaman.findMany({
      where: { userId },
      include: {
        barang: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!peminjaman.length) {
      throw new HttpException('Peminjaman tidak ditemukan untuk user ini', HttpStatus.NOT_FOUND);
    }

    return peminjaman;
  }

  async trackPeminjamanNotifikasi(userId: number) {
    const peminjaman = await this.prisma.peminjaman.findMany({
      where: { userId, notifikasi: 'Ya' },
      include: {
        barang: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!peminjaman.length) {
      throw new HttpException('Peminjaman tidak ditemukan untuk user ini', HttpStatus.NOT_FOUND);
    }

    return peminjaman;
  }

  async countPeminjamanWithCatatan(userId: number) {
    return this.prisma.peminjaman.count({
      where: {
        userId,
        catatan: { not: '' },
        notifikasi: 'Ya',
      },
    });
  }

  async getAllPeminjaman() {
    const peminjamanList = await this.prisma.peminjaman.findMany({
      include: {
        barang: { select: { name: true } },
        user: { select: { name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!peminjamanList.length) {
      throw new HttpException('Belum ada data peminjaman', HttpStatus.NOT_FOUND);
    }

    return peminjamanList;
  }

  async countPendingPeminjaman() {
    return this.prisma.peminjaman.count({ where: { status: 'PENDING' } });
  }

  async countDipinjamPeminjaman() {
    return this.prisma.peminjaman.count({ where: { status: 'APPROVED' } });
  }

  async countDitolakPeminjaman() {
    return this.prisma.peminjaman.count({ where: { status: 'REJECTED' } });
  }

  async countDikembalikanPeminjaman() {
    return this.prisma.peminjaman.count({ where: { status: 'DIKEMBALIKAN' } });
  }
}
