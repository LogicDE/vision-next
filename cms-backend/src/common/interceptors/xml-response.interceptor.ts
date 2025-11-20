import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toXml(name: string, value: any): string {
  if (value === null || value === undefined) {
    return `<${name}/>`;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return `<${name}>${escapeXml(String(value))}</${name}>`;
  }

  if (Array.isArray(value)) {
    return value.map((item) => toXml(name, item)).join('');
  }

  if (typeof value === 'object') {
    const children = Object.entries(value)
      .map(([k, v]) => toXml(k, v))
      .join('');
    return `<${name}>${children}</${name}>`;
  }

  return `<${name}>${escapeXml(String(value))}</${name}>`;
}

function wrapAsXml(rootName: string, value: any): string {
  return `<?xml version="1.0" encoding="UTF-8"?>` + toXml(rootName, value);
}

@Injectable()
export class XmlResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpCtx = context.switchToHttp();
    const request = httpCtx.getRequest<Request>();
    const response = httpCtx.getResponse<Response>();

    const headers = request.headers || {};
    const accept = (headers['accept'] as string) || (headers['Accept'] as string) || '';
    const wantsXml =
      accept.includes('application/xml') ||
      accept.includes('text/xml');

    return next.handle().pipe(
      map((data) => {
        if (!wantsXml) {
          // Default: JSON
          return data;
        }

        const xml = wrapAsXml('response', data);
        response.setHeader('Content-Type', 'application/xml; charset=utf-8');
        return xml;
      }),
    );
  }
}
