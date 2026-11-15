import type { INestApplication } from '@nestjs/common';
import { json, type Request, type Response, type NextFunction } from 'express';
import { ApiErrorFilter } from './api-error.filter.js';

export function configureApp(app: INestApplication) {
  const origins = (process.env.WEB_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim());
  app.use(json({ limit: '3mb' }));
  app.enableCors({ origin: origins, credentials: true });
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
      req.headers.origin &&
      !origins.includes(req.headers.origin)
    ) {
      res.status(403).json({ message: 'Origin is not allowed.' });
      return;
    }
    next();
  });
  app.useGlobalFilters(new ApiErrorFilter());
}
