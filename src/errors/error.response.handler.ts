import { Response } from 'express';
import { BaseError } from './errros';

export default function (res: Response, err: any) {
  if (err instanceof BaseError) {
    return res.status(err.code).send({
      message: err.message,
      name: err.name,
      stack: err.stack
    });
  }
  console.error(err);
  return res.status(500).send({ message: 'internal server error' });
}
