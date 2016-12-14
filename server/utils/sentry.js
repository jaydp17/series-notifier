import raven from 'raven';
import config from '../config'; // eslint-disable-line import/extensions

const sentry = new raven.Client(config.sentry);
sentry.patchGlobal();

module.exports = sentry;
