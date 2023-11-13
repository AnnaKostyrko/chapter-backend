import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesForbiddenException } from 'src/helpers/regex/role-exception/forbidden-exception';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<number[]>('roles', [
      context.getClass(),
      context.getHandler(),
    ]);
    if (!roles.length) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const userRole = request.user?.role?.id;

    if (!userRole || !roles.includes(userRole)) {
      throw new RolesForbiddenException();
    }

    return true;
  }
}
