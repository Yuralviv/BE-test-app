import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
    MinLength,
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
} from 'class-validator';

function Match(property: string, validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'match',
            target: object.constructor,
            propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: unknown, args: ValidationArguments) {
                    const relatedPropertyName = args.constraints[0] as string | undefined;
                    if (!relatedPropertyName) {
                        return false;
                    }
                    const relatedValue = (args.object as Record<string, unknown>)[
                        relatedPropertyName
                    ];
                    return value === relatedValue;
                },
                defaultMessage(args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints as string[];
                    return `${args.property} must match ${relatedPropertyName}`;
                },
            },
        });
    };
}

export class ResetPasswordDto {


    @ApiProperty({ example: 'OldPassword1!' })
    @IsString()
    @IsNotEmpty()
    currentPassword: string;


    @ApiProperty({ example: 'NewPassword1!' })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(32)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message:
            'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    })
    newPassword: string;

    @ApiProperty({ example: 'NewPassword1!' })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(32)
    @Match('newPassword', { message: 'confirmPassword must match newPassword' })
    confirmPassword: string;
}
