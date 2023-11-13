import { HttpStatus, HttpException } from '@nestjs/common';

export const createResponse = (
  status: HttpStatus,
  message: string,
  isError: boolean = true,
) => {
  if (isError) {
    throw new HttpException({ status, error: message }, status);
  } else {
    return {
      status,
      message,
    };
  }
};
