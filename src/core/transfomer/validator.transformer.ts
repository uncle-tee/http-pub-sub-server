import { ArgumentMetadata, HttpException, HttpStatus, PipeTransform } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

export class ValidatorTransformerPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    if (!value) {
      return value;
    }

    const { metatype } = metadata;
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (!errors.length) {
      return value;
    }
    if (errors.length > 0) {
      throw new HttpException({
        message: this.buildError(errors)['message'],
        status: 'error',
        'data': null,
      }, HttpStatus.BAD_REQUEST);
    }
    return value;
  }


  private buildError(errors) {
    let result = {};
    const error = errors[0];
    if (error.children && error.children.length > 0) {
      result = { ...result, ...this.buildError(error.children) };
    } else {
      const prop = error.property;
      Object.entries(error.constraints).forEach(constraint => {
        result['message'] = `${constraint[1]}`;
      });
    }

    return result;
  }

  private toValidate(metatype): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.find((type) => metatype === type);
  }

}