

import { IsString, IsEmail, MinLength, IsOptional, validateSync, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from 'class-validator';

@ValidatorConstraint({ name: 'emailOrUsername', async: false })
class EmailOrUsernameConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const object = args.object as any;
    return !!(object.email || object.username);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Either email or username must be provided';
  }
}

function EmailOrUsername(validationOptions?: any) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: EmailOrUsernameConstraint,
    });
  };
}

export class LoginDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsString()
  @MinLength(6)
  password: string;
}

// export class LoginDto {
//   @IsOptional()
//   @IsEmail()
//   email?: string;

//   @IsOptional()
//   @IsString()
//   username?: string;

//   @IsString()
//   @MinLength(6)
//   password: string;

//   @EmailOrUsername()
//   emailOrUsername: string; // This property doesn't need to exist, it's just for validation
// }