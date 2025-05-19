import { LaborTime } from 'src/infrastructure/database/entities/labor-time.entity';

export class ResponseLaborTimeDto {
  time: string;
  description: string;

  constructor(laborTime: LaborTime) {
    this.time = laborTime.time;
    this.description = this.formatDescription(laborTime.time);
  }

  private formatDescription(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const hoursText = hours === 1 ? '1 hora' : `${hours} horas`;
    const minutesText = minutes === 1 ? '1 minuto' : `${minutes} minutos`;

    if (hours > 0 && minutes > 0) {
      return `${hoursText} ${minutesText}`;
    } else if (hours > 0) {
      return hoursText;
    } else {
      return minutesText;
    }
  }
}
