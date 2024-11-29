// uploads.service.ts
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { join } from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class UploadsService {
  async uploadFile(file: Express.Multer.File): Promise<any> {
    try {
      // check if the file is image
      if (
        !file.mimetype.includes('image') &&
        !file.mimetype.includes('video')
      ) {
        throw new BadRequestException('Invalid file type');
      }
      // Define the upload directory
      const uploadDir = join(__dirname, '..', '..', 'uploadFile');

      // Create directory if it doesn't exist
      await fs.mkdir(uploadDir, { recursive: true });

      // check if the file is already exist
      // const fileExist = await fs
      //   .stat(join(uploadDir, file.originalname))
      //   .catch(() => null);
      // if (fileExist) {
      //   throw new BadRequestException('File already exist');
      // }

      // Save the file in the directory
      const filePath = join(uploadDir, file.originalname);
      await fs.writeFile(filePath, file.buffer);

      return {
        folder_path: `/uploadFile/${file.originalname}`,
      }; // Return the path of the saved file
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
