import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as js2xmlparser from 'js2xmlparser';

@Injectable()
export class XmlResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const accept = request.headers['accept'] || '';

    const wantsXml =
      accept.includes('application/xml') ||
      accept.includes('text/xml');

    return next.handle().pipe(
      map((data) => {
        if (wantsXml) {
          return js2xmlparser.parse('response', data);
        }
        return data; // JSON by default
      }),
    );
  }
}
