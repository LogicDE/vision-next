import { Injectable } from '@nestjs/common';

@Injectable()
export class PredictionService {
  async predictBurnout(userId: string, metrics: any[]): Promise<number> {
    // Placeholder: retorna probabilidad entre 0 y 1
    // Aquí podrías integrar un modelo ML o API externa
    const score = Math.random(); // Ejemplo aleatorio
    return score;
  }
}
