import GreetingTextController from '../controllers/greeting-text.controller';
import { greetingText } from '../bot-config';

export default function () {
  if (process.env.CRON) return Promise.resolve();
  return GreetingTextController.set(greetingText)
    .then(console.log).catch(console.error); // eslint-disable-line no-console
}
