// @flow

import GreetingTextController from '../controllers/greeting-text.controller';
import BotConfig from '../bot-config';
import * as Logger from '../utils/logger';

export default function () {
  if (process.env.CRON) return Promise.resolve();

  const { greetingText } = BotConfig;
  return GreetingTextController.set(greetingText)
    .then(console.log).catch(Logger.error); // eslint-disable-line no-console
}
