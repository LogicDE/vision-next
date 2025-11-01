import { Injectable } from '@nestjs/common';
import { AlertsService } from '../../core/alerts/alerts.service';

@Injectable()
export class NotificationService {
  constructor(private alertsService: AlertsService) {}

  async sendNotifications(userId: string) {
    const alerts = await this.alertsService.getUserAlerts(userId);
    // En producción aquí podrías enviar push/email
    return alerts;
  }
}

