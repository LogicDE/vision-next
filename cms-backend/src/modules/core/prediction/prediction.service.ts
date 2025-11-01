import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PredictionService {
  constructor(private readonly httpService: HttpService) {}

  async predictBurnout(userId: string): Promise<any> {
    try {
      const url = `http://burnout-microservice:8001/api/burnout/analyze/${userId}`;
      const response = await firstValueFrom(this.httpService.get(url));
      // Retornamos todo el objeto de análisis para usar en ReportService
      return response.data;
    } catch (error) {
      console.error('Error calling burnout microservice:', error);
      throw new Error('Burnout prediction failed');
    }
  }
}
