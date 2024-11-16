import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BarangService } from './barang.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
// import { Multer } from 'multer'; // Add this import


@Controller('api/barang')
export class BarangController {
  constructor(private readonly barangService: BarangService) {}

  // Multer setup for file upload
  private static multerOptions = {
    storage: diskStorage({
      destination: './uploads', // Folder to store files
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `photo-${uniqueSuffix}${ext}`); // Filename with a unique suffix
      },
    }),
    limits: {
      fileSize: 2 * 1024 * 1024, // Limit file size to 2MB
    },
    fileFilter: (req, file, callback) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']; // Allowed image types
      if (allowedTypes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new HttpException('Invalid file type', HttpStatus.BAD_REQUEST), false);
      }
    },
  };

  // Route for adding barang (with photo upload)
  @Post('add')
  @UseInterceptors(FileInterceptor('photo', BarangController.multerOptions))
  async addBarang(
    @Body()
    body: {
      name: string;
      kategoriId: number;
      lokasi?: string;
      kondisi?: string;
      available?: string;
    },
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { name, kategoriId, lokasi, kondisi, available } = body;
    const photoPath = file ? `/uploads/${file.filename}` : null; // Store relative URL for the image

    // Call the service to add the barang
    return this.barangService.addBarang({
      name,
      kategoriId: parseInt(kategoriId.toString(), 10), // Ensure kategoriId is parsed to integer
      lokasi,
      kondisi,
      photo: photoPath,
      available,
    });
  }

  // Get all barang
  @Get()
  async getAllBarang() {
    return this.barangService.getAllBarang();
  }

  // Get available barang
  @Get('barangtersedia')
  async getAvailableBarang(@Query('kategoriId') kategoriId?: number) {
    return this.barangService.getAvailableBarang(
      kategoriId ? parseInt(kategoriId.toString(), 10) : undefined,
    );
  }

  // Get a barang by ID
  @Get(':id')
  async getBarangById(@Param('id') id: number) {
    const barang = await this.barangService.getBarangById(+id);
    if (!barang) {
      throw new HttpException('Barang not found', HttpStatus.NOT_FOUND);
    }
    return barang;
  }

  // Update a barang by ID
  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo', BarangController.multerOptions))
  async updateBarang(
    @Param('id') id: number,
    @Body()
    body: {
      name?: string;
      kategoriId?: number;
      lokasi?: string;
      kondisi?: string;
      available?: string;
    },
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { name, kategoriId, lokasi, kondisi, available } = body;

    // Prepare updated data
    const updatedData: any = {};
    if (name) updatedData.name = name;
    if (kategoriId) updatedData.kategoriId = parseInt(kategoriId.toString(), 10); // Ensure kategoriId is parsed to integer
    if (lokasi) updatedData.lokasi = lokasi;
    if (kondisi) updatedData.kondisi = kondisi;
    if (available) updatedData.available = available;
    if (file) updatedData.photo = `/uploads/${file.filename}`; // Save the relative URL of the uploaded file

    // Call the service to update the barang
    return this.barangService.updateBarang(+id, updatedData);
  }

  // Delete a barang by ID
  @Delete(':id')
  async deleteBarang(@Param('id') id: number) {
    await this.barangService.deleteBarang(+id);
    return { message: 'Barang deleted successfully' };
  }
}
