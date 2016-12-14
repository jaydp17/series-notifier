// @flow

import Promise from 'bluebird';
import Bot from 'messenger-bot';
import BotController from '../controllers/bot.controller';
import * as Logger from '../utils/logger';

const Constants = require('../constants.json');

const bot = new Bot({
  token: Constants.fb.PAGE_TOKEN,
  verify: Constants.fb.VERIFY_TOKEN,
});

bot.on('error', (err) => {
  Logger.error(err);
});

bot.on('message', (payload: {sender: Object, message: Object}, reply: Function) => {
  /** @type {{text, is_echo, quick_reply}} */
  const { message } = payload;
  const text = (message.text || '').trim();
  if (message.is_echo || !text) return;

  const senderId = payload.sender.id;

  const getReply = (): Promise<any> => {
    if (message.quick_reply) {
      const quickReply = JSON.parse(message.quick_reply.payload);
      return BotController.onQuickReply(senderId, quickReply.action);
    }
    return BotController.onMessage(senderId, text);
  };
  getReply().then(results => reply(results, Logger.error))
    .catch((err) => {
      Logger.error(err);
      return reply({ text: 'Sorry something went wrong :/' }, console.log); // eslint-disable-line no-console
    });
});

/**
 * Postbacks are back end calls to your webhook when buttons are tapped
 */
bot.on('postback', (payload, reply) => {
  let data = payload.postback.payload;
  data = JSON.parse(data);

  const { action, series } = data;
  const senderId = payload.sender.id;
  BotController.onPostBack(senderId, action, series)
    .then(result => reply(result, console.log)) // eslint-disable-line no-console
    .catch((err) => {
      Logger.error(err);
      return reply({ text: 'Sorry something went wrong :/' }, console.log); // eslint-disable-line no-console
    });
});

export default function () {
  return bot.middleware();
}
