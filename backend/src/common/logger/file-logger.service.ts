import { Injectable, LoggerService, ConsoleLogger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileLoggerService extends ConsoleLogger implements LoggerService {
  private logDir: string;

  constructor(context?: string) {
    super(context);
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private writeToFile(level: string, message: string, context?: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} [${level}] ${context ? `[${context}]` : ''} ${message}\n`;
    
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(this.logDir, `${today}.log`);
    
    try {
      fs.appendFileSync(logFile, logMessage, { encoding: 'utf8' });
    } catch (error) {
      // Если не удалось записать в файл, выводим ошибку в консоль
      console.error('Failed to write log to file:', error.message);
    }
  }

  log(message: string, context?: string) {
    super.log(message, context);
    this.writeToFile('INFO', message, context);
  }

  error(message: string, trace?: string, context?: string) {
    super.error(message, trace, context);
    this.writeToFile('ERROR', `${message}${trace ? '\n' + trace : ''}`, context);
  }

  warn(message: string, context?: string) {
    super.warn(message, context);
    this.writeToFile('WARN', message, context);
  }

  debug(message: string, context?: string) {
    super.debug(message, context);
    this.writeToFile('DEBUG', message, context);
  }

  verbose(message: string, context?: string) {
    super.verbose(message, context);
    this.writeToFile('VERBOSE', message, context);
  }
}