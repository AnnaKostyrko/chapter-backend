// name-validator.ts

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
    const nameParts = name.split('-'); // Розділити ім'я або прізвище за дефісом

    if (nameParts.length === 3) {
      return nameParts.every((part) => namesValidator.test(part));
    }

    return namesValidator.test(name);
  }
}
