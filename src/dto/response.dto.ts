export class ResponseDto<T> {
  data: T;
  code?: number;


  constructor(data: T, code?: number) {
    this.data = data;
    this.code = code;
  }
}