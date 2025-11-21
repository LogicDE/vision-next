import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../../auth/auth.module';
import { Event } from '../../../entities/event.entity';
import { Group } from '../../../entities/group.entity';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Group]),
    AuthModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
