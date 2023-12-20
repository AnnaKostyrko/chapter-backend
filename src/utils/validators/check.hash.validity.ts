import { HttpException, HttpStatus } from '@nestjs/common';

export const checkHashValidity = (hashDate: Date): void => {
  const currentDate = new Date();
  const timeDifference = (currentDate.getTime() - hashDate.getTime()) / 60000;

  if (timeDifference >= 15) {
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        error: 'Hash is not valid.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
};
