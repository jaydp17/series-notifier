import sentry from './sentry';
import CustomError from './custom-error';

// eslint-disable no-console

export const info = (msg: string, data: ?Object) => {
  console.info(msg, data);
};

export const error = (err: Error, data: ?Object) => {
  if (err instanceof CustomError) {
    sentry.captureException(err, err.extra);
  } else {
    sentry.captureException(err, data);
  }
  console.error(err);
};

export const warn = (msg: string, data: ?Object) => {
  console.warn(msg, data);
};

export const log = (msg: string) => {
  console.log(msg);
};
