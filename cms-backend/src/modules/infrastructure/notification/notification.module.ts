// src/modules/notification/notification.module.ts
import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AlertsModule } from '../../core/alerts/alerts.module';

@Module({
  imports: [AlertsModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}

//boilerplate
