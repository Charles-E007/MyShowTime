import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './event.schema';
import { EventService } from './event.service';
import { EventController } from './event-controller';
import { UsersModule } from '../users/users.module';
import { CloudinaryService } from '../../common/cloudinary.service';
@Module({
  imports: [MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]), UsersModule],
  controllers: [EventController],
  providers: [EventService, CloudinaryService],
  exports: [EventService],
})
export class EventModule {}
