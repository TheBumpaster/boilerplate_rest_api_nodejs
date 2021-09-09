import joi from 'joi';

const signUpBodySchema = joi.object({
    username: joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),

    password: joi.string()
        .min(8)
        .required()
});

/**
 * Validates sing request.body
 * @param payload
 * @constructor
 */
export function ValidateSignPayload(payload: unknown): Promise<boolean | joi.ValidationError> {
    return signUpBodySchema.validateAsync(payload)
}

