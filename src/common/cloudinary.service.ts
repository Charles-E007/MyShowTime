import 'multer';
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'my-show-time',
        },
        (error, result) => {
          if (error) return reject(error);
          
          // Sécurité pour TypeScript : on vérifie que 'result' existe bien
          if (!result) {
            return reject(new Error("L'envoi sur Cloudinary a échoué sans erreur explicite."));
          }
          
          resolve(result.secure_url); // Désormais 100% sûr pour TS
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}