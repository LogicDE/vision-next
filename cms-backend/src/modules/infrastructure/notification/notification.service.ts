import { Injectable } from '@nestjs/common';
import { AlertsService } from '../../core/alerts/alerts.service';

@Injectable()
export class NotificationService {
  constructor(private alertsService: AlertsService) {}

  async sendNotifications(userId: string, alerts: any[] = []) {
    // Si no se pasan alertas, obtenerlas desde AlertsService
    const alertsToSend = alerts.length
      ? alerts
      : await this.alertsService.getCombinedAlerts(userId, 0, {}); // 0 como predicción por defecto

    // Aquí podrías enviar push/email en producción
    return alertsToSend;
  }
}


