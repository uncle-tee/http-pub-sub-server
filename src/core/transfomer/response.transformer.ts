import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { tap } from 'rxjs/operators';
import { ResponseDto } from '../../dto/response.dto';
import { Observable } from 'rxjs';

@Injectable()
export class ResponseTransformer<T> implements NestInterceptor<ResponseDto<T>> {
  intercept(context: ExecutionContext, next: CallHandler<ResponseDto<T>>): Observable<any> | Promise<Observable<any>> {
    const response = context.switchToHttp().getResponse();
    return next.handle().pipe(tap(responseVal => {
      response.status(responseVal.code ?? 200);
    }));
  }

}