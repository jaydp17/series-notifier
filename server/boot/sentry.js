import raven from 'raven';

export default function (app: any) {
  const sentry = new raven.Client(process.env.SENTRY_URL);
  global.Sentry = sentry;
  sentry.patchGlobal();
}
