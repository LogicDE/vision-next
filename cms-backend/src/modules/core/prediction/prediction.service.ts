import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios'; // 👈 Importante

@Injectable()
export class PredictionService {
  constructor(private readonly httpService: HttpService) {}

  async predictBurnout(userId: string): Promise<any> {
    try {
      const url = `http://burnout-microservice:8001/api/burnout/analyze/${userId}`;

      // ⚙️ Token interno para autenticación entre microservicios
      const internalToken = process.env.INTERNAL_SERVICE_JWT;
      if (!internalToken) {
        console.warn(
          '[WARNING] INTERNAL_SERVICE_JWT no definido. Las llamadas al burnout-microservice pueden fallar con 403.'
        );
      }

      const headers = internalToken
        ? { Authorization: `Bearer ${internalToken}` }
        : {};

      // 🚀 Llamar al microservicio de burnout con el token
      const response = await firstValueFrom(
        this.httpService.get(url, { headers })
      );

      // Retornamos todo el objeto de análisis para usar en ReportService
      return response.data;
    } catch (err) {
      const error = err as AxiosError; // 👈 Tipamos correctamente

      console.error(
        'Error calling burnout microservice:',
        error.response?.status
          ? `[${error.response.status}] ${error.response.statusText}`
          : error.message || error
      );

      throw new Error('Burnout prediction failed');
    }
  }
}
