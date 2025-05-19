import { Logger } from '@nestjs/common';
import moment = require('moment-timezone');

export default class DateUtils {
  constructor(private readonly logger: Logger) {}

  public static getStarAndEndOfDay(): [Date, Date] {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));
    return [startOfDay, endOfDay];
  }

  public static formatHour(date: string): string {
    return new Date(date).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  public static getChileanTime(): moment.Moment {
    return moment(new Date()).tz('America/Santiago');
  }
}
