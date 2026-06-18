import { BadRequestException, Injectable, type PipeTransform } from "@nestjs/common";
import { ZodError, type ZodType } from "zod";

@Injectable()
export class ZodValidationPipe<TOutput> implements PipeTransform<unknown, TOutput> {
  constructor(private readonly schema: ZodType<TOutput>) {}

  transform(value: unknown): TOutput {
    return parseWithSchema(this.schema, value);
  }
}

export function parseWithSchema<TOutput>(schema: ZodType<TOutput>, value: unknown): TOutput {
  try {
    return schema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException({
        code: "validation_error",
        message: "Validation failed.",
        details: error.flatten()
      });
    }

    throw error;
  }
}
