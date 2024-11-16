import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PengaduanService {
  constructor(private readonly prisma: PrismaService) {}

  async createPengaduan(dto: any) {
    const { userId, kategori, deskripsi, photo, lokasi } = dto;
    const currentTime = new Date();
    const jam = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;

    try {
      return await this.prisma.pengaduan.create({
        data: {
          userId: parseInt(userId, 10),
          kategori,
          jam,
          deskripsi,
          date: currentTime,
          photo,
          lokasi,
          status: 'PENDING',
          catatan: '',
          tanggapan: '',
          notifikasi: '',
        },
      });
    } catch (error) {
      console.error('Error creating pengaduan:', error);
      throw new InternalServerErrorException('Failed to create pengaduan');
    }
  }

  async assignPelaksana(dto: any) {
    const { userId, pengaduanId } = dto;

    try {
      const userIdParsed = parseInt(userId, 10);
      const pengaduanIdParsed = parseInt(pengaduanId, 10);

      if (isNaN(userIdParsed) || isNaN(pengaduanIdParsed)) {
        throw new BadRequestException('Invalid userId or pengaduanId');
      }

      // Pertama buat pelaksana
      const pelaksana = await this.prisma.pelaksana.create({
        data: {
          userId: userIdParsed,
          pengaduanId: pengaduanIdParsed,
          tgl_selesai: null,
          is_selesai: 'Belum',
        },
      });

      // Update status pengaduan menjadi 'APPROVED'
      await this.prisma.pengaduan.update({
        where: { id: pengaduanIdParsed },
        data: { status: 'ONPROGGRESS' },
      });

      return pelaksana;
    } catch (error) {
      console.error('Error assigning pelaksana:', error);
      throw new InternalServerErrorException('Failed to assign pelaksana');
    }
  }

  async getAllPelaksana() {
    return this.prisma.pelaksana.findMany({
      include: {
        pengaduan: {
          select: { deskripsi: true, kategori: true },
        },
        user: {
          select: { name: true, no_hp: true, email: true },
        },
      },
      orderBy: {
        tgl_penugasan: 'desc',
      },
    });
  }

  async approvePengaduan(id: number, catatan: string) {
    return this.prisma.pengaduan.update({
      where: { id },
      data: { status: 'APPROVED', catatan, notifikasi: 'Ya' },
    });
  }

  async rejectPengaduan(id: number, catatan: string) {
    return this.prisma.pengaduan.update({
      where: { id },
      data: { status: 'REJECTED', catatan, notifikasi: 'Ya' },
    });
  }

  async feedbackPengaduan(id: number, tanggapan: string) {
    try {
      const pengaduan = await this.prisma.pengaduan.findUnique({ where: { id } });

      if (!pengaduan) {
        throw new NotFoundException('Pengaduan not found');
      }

      return await this.prisma.$transaction([
        this.prisma.pengaduan.update({
          where: { id },
          data: { status: 'COMPLETED', tanggapan },
        }),
        this.prisma.pelaksana.updateMany({
          where: { pengaduanId: id },
          data: { is_selesai: 'Sudah', tgl_selesai: new Date() },
        }),
      ]);
    } catch (error) {
      console.error('Error updating pengaduan and pelaksana:', error);
      throw new InternalServerErrorException('Failed to provide feedback for pengaduan');
    }
  }

  async pencetNotifikasi(userId: number) {
    const result = await this.prisma.pengaduan.updateMany({
      where: { userId },
      data: { notifikasi: 'Tidak' },
    });

    if (result.count === 0) {
      throw new NotFoundException('No notifications found for this user');
    }

    return result;
  }

  async trackPengaduan(userId: number) {
    return this.prisma.pengaduan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async trackPengaduanNotifikasi(userId: number) {
    return this.prisma.pengaduan.findMany({
      where: { userId, notifikasi: 'Ya' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countJumlahPengaduan(userId: number) {
    return this.prisma.pengaduan.count({
      where: {
        userId,
        catatan: { not: '' },
        notifikasi: 'Ya',
      },
    });
  }

  async getAllPengaduan() {
    const pengaduanList = await this.prisma.pengaduan.findMany({
      include: {
        user: {
          select: { name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!pengaduanList.length) {
      throw new NotFoundException('No pengaduan data found');
    }

    return pengaduanList;
  }

  async countPendingPengaduan() {
    return this.prisma.pengaduan.count({
      where: { status: 'PENDING' },
    });
  }

  async countPendingPelaksana() {
    return this.prisma.pelaksana.count({
      where: { is_selesai: 'Belum' },
    });
  }

  async countPengaduanDisetujui() {
    return this.prisma.pengaduan.count({
      where: { status: 'APPROVED' },
    });
  }

  async countPengaduanDitolak() {
    return this.prisma.pengaduan.count({
      where: { status: 'REJECTED' },
    });
  }

  async countPengaduanSelesai() {
    return this.prisma.pengaduan.count({
      where: { status: 'COMPLETED' },
    });
  }

  async countPengaduanProgress() {
    return this.prisma.pengaduan.count({
      where: { status: 'ONPROGGRESS' },
    });
  }
}
