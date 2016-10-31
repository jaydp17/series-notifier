// @flow

import GreetingTextController from '../controllers/greeting-text.controller';
import BotConfig from '../bot-config';

export default function () {
  if (process.env.CRON) return Promise.resolve();

  const { greetingText } = BotConfig;
  return GreetingTextController.set(greetingText)
    .then(console.log).catch(console.error); // eslint-disable-line no-console
}
