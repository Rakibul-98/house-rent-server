import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import AppError from '../errors/AppError';
import handleValidationError from '../errors/handleValidationError';
import { TErrorSources } from '../interface/error';
import config from '../config';
import handleZodValidationError from '../errors/handleZodValidationError';
import mongooseCastError from '../errors/mongooseCastError';
import duplicateProductError from '../errors/duplicateProductError';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Sorry, Something went wrong!';
  let errorSources: TErrorSources = [
    {
      path: '',
      message: 'Something went wrong',
    },
  ];

  // handling zor validation error
  if (err instanceof ZodError) {
    const simplifiedError = handleZodValidationError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
  } 
  // handling generic error
  else if (err?.name === 'ValidationError') {
    const simplifiedError = handleValidationError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
  } 
  // handling mongoose casting error
  else if (err?.name === 'CastError') {
    const simplifiedError = mongooseCastError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
  } 
 // handling duplicate user error
  else if (err?.code === 11000) {
    const simplifiedError = duplicateProductError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
  } 
 // handling custom errors
  else if (err instanceof AppError) {
    statusCode = err?.statusCode;
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  }
  // handling other errors
  else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  }

  // send error response format to client side
  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    error: err.issues ? err.issues : err,
    stack: config.node_env === 'development' ? err?.stack : null,
  });

  return undefined;

};

export default globalErrorHandler;