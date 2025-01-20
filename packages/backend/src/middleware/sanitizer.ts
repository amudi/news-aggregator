import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

export const sanitizeRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      return xss(value.trim());
    }
    if (Array.isArray(value)) {
      return value.map((item) => sanitizeValue(item));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.keys(value).reduce(
        (acc, key) => ({
          ...acc,
          [key]: sanitizeValue(value[key]),
        }),
        {}
      );
    }
    return value;
  };

  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query);
  req.params = sanitizeValue(req.params);

  next();
};
