import 'multer';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  Render,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express'; 
import { EventService } from './event.service';
import { CreateEventDto } from './create-event.dto';
import { UpdateEventDto } from './update-event.dto';
import { CloudinaryService } from '../../common/cloudinary.service';
import * as express from 'express';

@Controller('events')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateEventDto,
    @Res() res: express.Response,
  ) {
    console.log("\n=== 🕵️‍♂️ [DEBUG CONTROLLER] DÉBUT DE LA REQUÊTE POST ===");
    
    // 1. On vérifie si NestJS reçoit bien le fichier du formulaire
    if (file) {
      console.log("✅ Fichier détecté :", {
        nom: file.originalname,
        taille: file.size,
        mimetype: file.mimetype
      });
    } else {
      console.log("❌ ÉCHEC : Aucun fichier n'a été intercepté par le contrôleur !");
    }

    if (file) {
      try {
        const cloudinaryUrl = await this.cloudinaryService.uploadImage(file);
        
        console.log("📡 Retour brut de Cloudinary :", cloudinaryUrl);
        console.log("Type du retour Cloudinary :", typeof cloudinaryUrl);

        // 2. Sécurité : Si Cloudinary renvoie un objet au lieu d'une string URL
        if (typeof cloudinaryUrl === 'object' && cloudinaryUrl !== null) {
          console.log("⚠️ Cloudinary a renvoyé un OBJET. Extraction de la clé 'secure_url'...");
          dto['imageUrl'] = cloudinaryUrl['secure_url'] || cloudinaryUrl['url'];
        } else {
          dto['imageUrl'] = cloudinaryUrl;
        }

        console.log("💾 Valeur finale injectée dans dto.imageUrl :", dto['imageUrl']);

      } catch (error) {
        console.error("❌ Erreur critique lors de l'upload Cloudinary:", error);
      }
    }

    // On envoie au service (qui a aussi son console.log maintenant)
    await this.eventService.create(dto);

    return res.redirect('/'); 
  }

  // --- VUES RENDER (Architecture MVC) ---

  @Get(':id')
  @Render('detail')
  async showEvent(@Param('id') id: string) {
    const event = await this.eventService.findOne(id);
    return { event };
  }

  // --- API ENDPOINTS / VUES GLOBALES ---

  @Get()
  async findAll() {
    // Si cette route doit aussi afficher une page hbs (ex: la liste), ajoute @Render('nom_du_template')
    return this.eventService.findAll();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventService.remove(id);
  }
}