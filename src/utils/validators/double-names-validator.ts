import { namesValidator } from 'src/helpers/regex/names-regexp';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

@Injectable()
@ValidatorConstraint({ name: 'IsValidName', async: false })
export class IsValidName implements ValidatorConstraintInterface {
  validate(name: string) {
    const nameParts = name.split('-');
    if (nameParts.length === 2) {
      return nameParts.every((part) => namesValidator.test(part));
    } else if (nameParts.length === 1) {
      return namesValidator.test(name);
    }

    return false;
  }
}
