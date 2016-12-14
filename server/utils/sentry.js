import raven from 'raven';

const sentry = new raven.Client('https://97f72c710a3242d1814c68d9590e8d3c:9544bf4a57ca46f48f21841cae159a9b@sentry.io/122234');
sentry.patchGlobal();

module.exports = sentry;
