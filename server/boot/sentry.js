import raven from 'raven';

export default function (app: any) {
  const sentry = new raven.Client(app.get('sentry'));
  global.Sentry = sentry;
  sentry.patchGlobal();
}
