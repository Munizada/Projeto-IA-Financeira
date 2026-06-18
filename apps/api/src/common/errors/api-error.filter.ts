import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus
} from "@nestjs/common";
import { FinancialCoreError } from "@ia-financeira/core";
import { ZodError } from "zod";

type ErrorBody = {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
};

type HttpResponseLike = {
  status(code: number): {
    json(body: ErrorBody): void;
  };
};

type PrismaLikeError = {
  code: string;
  message?: string;
};

@Catch()
export class ApiErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<HttpResponseLike>();
    const body = this.mapException(exception);

    response.status(body.statusCode).json(body);
  }

  private mapException(exception: unknown): ErrorBody {
    if (exception instanceof BadRequestException) {
      return this.fromHttpException(exception, "validation_error");
    }

    if (exception instanceof HttpException) {
      return this.fromHttpException(exception, "http_error");
    }

    if (exception instanceof ZodError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "validation_error",
        message: "Validation failed.",
        details: exception.flatten()
      };
    }

    if (exception instanceof FinancialCoreError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "financial_core_error",
        message: exception.message
      };
    }

    if (isPrismaLikeError(exception)) {
      return this.fromPrismaError(exception);
    }

    if (exception instanceof Error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: "internal_error",
        message: exception.message || "Unexpected error."
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: "internal_error",
      message: "Unexpected error."
    };
  }

  private fromHttpException(exception: HttpException, fallbackCode: string): ErrorBody {
    const statusCode = exception.getStatus();
    const rawResponse = exception.getResponse();

    if (typeof rawResponse === "string") {
      return {
        statusCode,
        code: fallbackCode,
        message: rawResponse
      };
    }

    if (isObjectRecord(rawResponse)) {
      const message = this.pickMessage(rawResponse.message);
      const code =
        typeof rawResponse.code === "string"
          ? rawResponse.code
          : statusCode === HttpStatus.BAD_REQUEST
            ? "validation_error"
            : fallbackCode;

      return {
        statusCode,
        code,
        message,
        details: rawResponse.details
      };
    }

    return {
      statusCode,
      code: fallbackCode,
      message: exception.message
    };
  }

  private fromPrismaError(error: PrismaLikeError): ErrorBody {
    if (error.code === "P2025") {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        code: "resource_not_found",
        message: "Resource not found."
      };
    }

    if (error.code === "P2002") {
      return {
        statusCode: HttpStatus.CONFLICT,
        code: "unique_constraint_violation",
        message: "Unique constraint violation."
      };
    }

    if (error.code === "P2003") {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "invalid_relation",
        message: "Invalid relation for requested operation."
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: "database_error",
      message: error.message ?? "Database error."
    };
  }

  private pickMessage(value: unknown): string {
    if (typeof value === "string" && value.length > 0) {
      return value;
    }

    if (Array.isArray(value) && typeof value[0] === "string") {
      return value[0];
    }

    return "Request failed.";
  }
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPrismaLikeError(value: unknown): value is PrismaLikeError {
  return isObjectRecord(value) && typeof value.code === "string";
}
