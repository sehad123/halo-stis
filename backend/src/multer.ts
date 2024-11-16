import { Injectable } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

// Multer file storage configuration
const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder where files will be stored
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = extname(file.originalname);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

@Injectable()
export class FileService {
  // File upload configuration
  uploadFile() {
    return FileInterceptor('photo', {
      storage,
    });
  }
}
