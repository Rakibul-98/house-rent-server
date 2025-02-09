import { TGenericErrorResponse, TErrorSources } from '../interface/error';


const duplicateUserError = (err: any): TGenericErrorResponse => {
  const match = err.message.match(/"([^"]*)"/);

  const extractedValue = match && match[1];

  const errorSources: TErrorSources = [
    {
      path: ' ',
      message: `${extractedValue} is already exists!`,
    },
  ];

  const statusCode = 400;

  return {
    statusCode,
    message: 'Invalid user!!',
    errorSources,
  };
};

export default duplicateUserError;