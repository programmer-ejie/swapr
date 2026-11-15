import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { DatabaseService } from './database/database.service.js';
import { hostImage } from '../scripts/imgbb.mjs';

@Injectable()
export class ImagesService {
  constructor(private readonly db: DatabaseService) {}
  async host(value: string, name: string): Promise<string> {
    if (!value || !value.startsWith('data:')) return value;
    try {
      return await hostImage(
        this.db.pool,
        Buffer.from(value.slice(value.indexOf(',') + 1), 'base64'),
        name,
      );
    } catch {
      throw new ServiceUnavailableException(
        'Image upload failed. Please try saving again.',
      );
    }
  }
  async isKnown(url: string): Promise<boolean> {
    return (
      (await this.db.query('select 1 from swapr.images where url=$1', [url]))
        .length > 0
    );
  }
}
