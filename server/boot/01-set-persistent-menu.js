// @flow

import PersistentMenu from '../controllers/persistentmenu.controller';
import BotConfig from '../bot-config';
import * as Logger from '../utils/logger';

export default function () {
  if (process.env.CRON) return Promise.resolve();

  const { persistentMenu } = BotConfig;
  const buttons = Object.keys(persistentMenu)
    .map(key => persistentMenu[key]);

  return PersistentMenu.set(buttons)
    .then(console.log).catch(Logger.error); // eslint-disable-line no-console
}
