import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { PeminjamanService } from './peminjaman.service';
import { ParseIntPipe } from '@nestjs/common';
import * as path from 'path';

@Controller('api/peminjaman')
export class PeminjamanController {
  constructor(private readonly peminjamanService: PeminjamanService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('bukti_persetujuan', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + path.extname(file.originalname);
          cb(null, uniqueSuffix);
        },
      }),
    }),
  )
  async createPeminjaman(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    const {
      userId,
      barangId,
      startDate,
      endDate,
      startTime,
      endTime,
      keperluan,
      nama_kegiatan,
    } = body;

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const bukti_persetujuan = file ? file.filename : null;

    return this.peminjamanService.createPeminjaman({
      userId: parseInt(userId, 10),
      barangId: parseInt(barangId, 10),
      startDate,
      endDate,
      startTime,
      endTime,
      keperluan,
      nama_kegiatan,
      bukti_persetujuan,
    });
  }

  @Put(':id/approve')
  async approvePeminjaman(
    @Param('id', ParseIntPipe) id: number,
    @Body('catatan') catatan: string,
  ) {
    return this.peminjamanService.approvePeminjaman(id, catatan);
  }

  @Put(':id/reject')
  async rejectPeminjaman(
    @Param('id', ParseIntPipe) id: number,
    @Body('catatan') catatan: string,
  ) {
    return this.peminjamanService.rejectPeminjaman(id, catatan);
  }

  @Get('/user/:userId')
  async trackPeminjaman(@Param('userId', ParseIntPipe) userId: number) {
    return this.peminjamanService.trackPeminjaman(userId);
  }

  @Get('/user/:userId/notif')
  async trackPeminjamanNotifikasi(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.peminjamanService.trackPeminjamanNotifikasi(userId);
  }

  @Put('/user/:userId/notifikasi')
  async updateNotifikasi(@Param('userId', ParseIntPipe) userId: number) {
    return this.peminjamanService.pencetNotifikasi(userId);
  }

  @Get('/user/:userId/count')
  async countPeminjamanWithCatatan(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    try {
      const count = await this.peminjamanService.countPeminjamanWithCatatan(userId);
      return { count };  // Mengembalikan count dalam bentuk objek JSON
    } catch (error) {
      // Jika terjadi error, Anda bisa mengirimkan status error
      throw new HttpException(
        'Error fetching peminjaman count',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  

  @Get()
  async getAllPeminjaman() {
    return this.peminjamanService.getAllPeminjaman();
  }

  @Get('/count/pending')
  async countPending() {
    const pendingCount = await this.peminjamanService.countPendingPeminjaman();
    return {pendingCount}; // pastikan mengembalikan angka langsung
  }
  

  @Get('/count/approved')
  async countApproved() {
    const pendingCount = await this.peminjamanService.countDipinjamPeminjaman();
    return {pendingCount}; // mengembalikan angka
  }
  

  @Get('/count/reject')
  async countRejected() {
    const pendingCount = await this.peminjamanService.countDitolakPeminjaman();
    return {pendingCount};
  }

  @Get('/count/dikembalikan')
  async countReturned() {
    const pendingCount = await this.peminjamanService.countDikembalikanPeminjaman();
    return {pendingCount};
  }

  @Put(':id/kembali')
  @UseInterceptors(
    FileInterceptor('bukti_pengembalian', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + path.extname(file.originalname);
          cb(null, uniqueSuffix);
        },
      }),
    }),
  )
  async returnBarang(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const buktiPengembalian = file ? file.filename : null;

    if (!buktiPengembalian) {
      throw new BadRequestException('Bukti pengembalian tidak diunggah');
    }

    return this.peminjamanService.returnBarang(id, buktiPengembalian);
  }
}
