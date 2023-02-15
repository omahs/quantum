import { ArgumentsHost, BadRequestException, Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';

/**
 * Handle all common prisma exceptions here
 */

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaErrorExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    switch (exception.code) {
      // Prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
      case 'P2002': {
        throw new BadRequestException('Unique constraint failed');
      }
      default:
        // Default 500 error code
        super.catch(exception, host);
        break;
    }
  }
}
