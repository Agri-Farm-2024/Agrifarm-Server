import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isTimeEndGreaterThanStart', async: false })
export class IsTimeEndGreaterThanStart implements ValidatorConstraintInterface {
  validate(time_end: number, args: ValidationArguments) {
    const object = args.object as any;
    return time_end > object.time_start; // Ensure time_end is greater than time_start
  }

  defaultMessage(args: ValidationArguments) {
    return 'time_end must be greater than time_start';
  }
}
