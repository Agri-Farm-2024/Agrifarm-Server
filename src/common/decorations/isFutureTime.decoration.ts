import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isFutureDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!(value instanceof Date)) return false; // Ensure the value is a Date object
          const now = new Date();
          return value > now; // Check if the date is in the future
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a date in the future`;
        },
      },
    });
  };
}
