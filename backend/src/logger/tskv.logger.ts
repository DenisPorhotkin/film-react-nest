import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class TskvLogger implements LoggerService {
  private formatMessage(level: string, message: any, ...optionalParams: any[]) {
    // Базовые поля
    const parts = [`level=${level}`, `message=${String(message)}`];

    if (optionalParams.length) {
      parts.push(`optionalParams=${JSON.stringify(optionalParams)}`);
    }
    // Добавляем timestamp (опционально)
    parts.push(`timestamp=${new Date().toISOString()}`);
    // Объединяем табуляцией и добавляем перевод строки
    return parts.join('\t') + '\n';
  }

  log(message: any, ...optionalParams: any[]) {
    process.stdout.write(this.formatMessage('log', message, optionalParams));
  }

  error(message: any, ...optionalParams: any[]) {
    process.stderr.write(this.formatMessage('error', message, optionalParams));
  }

  warn(message: any, ...optionalParams: any[]) {
    process.stderr.write(this.formatMessage('warn', message, optionalParams));
  }

  debug(message: any, ...optionalParams: any[]) {
    process.stdout.write(this.formatMessage('debug', message, optionalParams));
  }

  verbose(message: any, ...optionalParams: any[]) {
    process.stdout.write(
      this.formatMessage('verbose', message, optionalParams),
    );
  }
}
