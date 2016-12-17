import CustomError from './custom-error';

// eslint-disable no-console

export const info = (msg: string, data: ?Object) => {
  console.info(msg, data);
};

export const error = (err: Error, data: ?Object) => {
  if (err instanceof CustomError) {
    Sentry.captureException(err, {
      extra: err.extra,
      tags: {
        env: process.env.NODE_ENV,
      },
    });
  } else {
    Sentry.captureException(err, data);
  }
  console.error(err);
};

export const warn = (msg: string, data: ?Object) => {
  console.warn(msg, data);
};

export const log = (msg: string) => {
  console.log(msg);
};
