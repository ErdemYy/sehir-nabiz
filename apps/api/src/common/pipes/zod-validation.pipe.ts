import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown): unknown {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const messages = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new BadRequestException({
        statusCode: 400,
        message: messages,
        error: 'Bad Request',
      });
    }

    return result.data;
  }
}
