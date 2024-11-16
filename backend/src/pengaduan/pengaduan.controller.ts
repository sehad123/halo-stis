import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { PengaduanService } from './pengaduan.service';  // Ensure this is correctly imported

@Controller('api/pengaduan')
export class PengaduanController {
  constructor(private readonly pengaduanService: PengaduanService) {}  // Corrected the variable name

  @Post()
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}-${file.originalname}`);
        },
      }),
    }),
  )
  async createPengaduan(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const photo = file ? `/uploads/${file.filename}` : null;
      const pengaduan = await this.pengaduanService.createPengaduan({ ...body, photo });  // Corrected method call
      return pengaduan;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('assign_pelaksana')
  async assignPelaksana(@Body() body: { userId: number; pengaduanId: number }) {
    try {
      return await this.pengaduanService.assignPelaksana(body);  // Corrected method call
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('pelaksana')
  async getPelaksana() {
    try {
      return await this.pengaduanService.getAllPelaksana();  // Corrected method call
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  
  @Put(':id/approve')
  async approvePengaduan(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { catatan: string }, // ubah beban_pengaduan menjadi string
  ) {
    try {
      if (!body.catatan) {
        throw new HttpException('Invalid body', HttpStatus.BAD_REQUEST);
      }
      return await this.pengaduanService.approvePengaduan(
        id,
        body.catatan
      );
    } catch (error) {
      console.error('Error in approvePengaduan:', error.message);
      throw new HttpException(
        'Failed to approve pengaduan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  

  @Put(':id/reject')
  async rejectPengaduan(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { catatan: string },
  ) {
    try {
      if (!body.catatan) {
        throw new HttpException('Invalid body', HttpStatus.BAD_REQUEST);
      }
      return await this.pengaduanService.rejectPengaduan(id, body.catatan);
    } catch (error) {
      console.error('Error in rejectPengaduan:', error.message);
      throw new HttpException(
        'Failed to reject pengaduan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

 @Put(':id/feedback')
  async feedbackPengaduan(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { tanggapan: string },
  ) {
    try {
      if (!body.tanggapan) {
        throw new HttpException('Invalid body', HttpStatus.BAD_REQUEST);
      }
      return await this.pengaduanService.feedbackPengaduan(id, body.tanggapan);
    } catch (error) {
      console.error('Error in feedbackPengaduan:', error.message);
      throw new HttpException(
        'Failed to give feedback',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('user/:userId/notifikasi')
  async pencetNotifikasi(@Param('userId',ParseIntPipe) userId: number) {
    try {
      return this.pengaduanService.pencetNotifikasi(userId);  // Corrected method call
    } catch (error) {
      throw new HttpException('Failed to update notifications', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

 
  @Get('/user/:userId')
  async trackPengaduan(@Param('userId', ParseIntPipe) userId: number) {
    return this.pengaduanService.trackPengaduan(userId);
  }

  @Get('user/:userId/notif')
  async trackPengaduanNotifications(@Param('userId',ParseIntPipe) userId: number) {
    try {
      return this.pengaduanService.trackPengaduanNotifikasi(userId);  // Corrected method call
    } catch (error) {
      throw new HttpException('Failed to fetch notifications', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  @Get('/user/:userId/count')
  async countJumlahPengaduan(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    try {
      const count = await this.pengaduanService.countJumlahPengaduan(userId);
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
  async getAllPengaduan() {
    try {
      return await this.pengaduanService.getAllPengaduan();  // Corrected method call
    } catch (error) {
      throw new HttpException('Failed to fetch all pengaduan', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

 
  // Fungsi untuk menghitung jumlah pengaduan dengan status pending
  @Get('count/pending')
  async countPendingPengaduan() {
    try {
      const count = await this.pengaduanService.countPendingPengaduan();
      return { count };
    } catch (error) {
      throw new HttpException(
        'Failed to count pending pengaduan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Fungsi untuk menghitung jumlah pengaduan yang disetujui
  @Get('count/approved')
  async countApprovedPengaduan() {
    try {
      const count = await this.pengaduanService.countPengaduanDisetujui();
      return { count };
    } catch (error) {
      throw new HttpException(
        'Failed to count approved pengaduan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Fungsi untuk menghitung jumlah pengaduan yang ditolak
  @Get('count/rejected')
  async countRejectedPengaduan() {
    try {
      const count = await this.pengaduanService.countPengaduanDitolak();
      return { count };
    } catch (error) {
      throw new HttpException(
        'Failed to count rejected pengaduan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get('count/progress')
  async countProgressPengaduan() {
    try {
      const count = await this.pengaduanService.countPengaduanProgress();
      return { count };
    } catch (error) {
      throw new HttpException(
        'Failed to count rejected pengaduan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Fungsi untuk menghitung jumlah pelaksana yang belum ditugaskan
  @Get('pelaksana/belum')
  async countPendingPelaksana() {
    try {
      const count = await this.pengaduanService.countPendingPelaksana();
      return { count };
    } catch (error) {
      throw new HttpException(
        'Failed to count pending pelaksana',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Fungsi untuk menghitung jumlah pengaduan yang selesai
  @Get('count/completed')
  async countCompletedPengaduan() {
    try {
      const count = await this.pengaduanService.countPengaduanSelesai();
      return { count };
    } catch (error) {
      throw new HttpException(
        'Failed to count completed pengaduan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
