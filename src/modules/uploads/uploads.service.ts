// upload.service.ts

import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class UploadsService {
  async uploadFiles(files: Express.Multer.File[]) {
    const uploadDir = join(__dirname, '..', '..', 'uploadFile'); // Đường dẫn thư mục tải lên

    // Tạo thư mục nếu nó không tồn tại
    await fs.mkdir(uploadDir, { recursive: true });

    // Lưu từng tệp vào thư mục
    const savedFiles = files.map(async (file) => {
      const filePath = join(uploadDir, file.originalname);
      await fs.writeFile(filePath, file.buffer);
      return filePath; // Trả về đường dẫn tệp đã lưu
    });

    return Promise.all(savedFiles); // Trả về danh sách các đường dẫn tệp đã lưu
  }
}
