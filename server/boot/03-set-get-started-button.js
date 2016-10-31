// @flow

import GetStartedButtonController from '../controllers/get-started-button.controller';

export default function () {
  if (process.env.CRON) return Promise.resolve();
  return GetStartedButtonController.set()
    .then(console.log).catch(console.error); // eslint-disable-line no-console
}
