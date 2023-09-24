import { HttpStatus, HttpException } from '@nestjs/common';

export const createResponse = (
  status: HttpStatus,
  message: string,
  isErrorMessage: boolean = true,
) => {
  return new HttpException(
    isErrorMessage ? { status, error: message } : { status, message },
    status,
  );
};
