import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { ValidationError } from '../types/error';

export const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Run all validations
      await Promise.all(validations.map((validation) => validation.run(req)));

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map((error) => ({
          field:
            'type' in error && error.type === 'field'
              ? error.path
              : String(error.type),
          message: error.msg,
          value: 'value' in error ? error.value : undefined,
        }));

        throw new ValidationError('Validation failed', formattedErrors);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
