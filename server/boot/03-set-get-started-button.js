// @flow

import GetStartedButtonController from '../controllers/get-started-button.controller';
import * as Logger from '../utils/logger';

export default function () {
  if (process.env.CRON) return Promise.resolve();
  return GetStartedButtonController.set()
    .then(console.log).catch(Logger.error); // eslint-disable-line no-console
}
