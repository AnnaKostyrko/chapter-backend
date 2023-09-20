import { HttpException, HttpStatus } from '@nestjs/common';

export class RolesForbiddenException extends HttpException {
  constructor() {
    super(
      'You do not have permission for this operation!',
      HttpStatus.FORBIDDEN,
    );
  }
}
