// @flow

import Promise from 'bluebird';
import Bot from 'messenger-bot';
import BotController from '../controllers/bot.controller';

const Constants = require('../constants.json');

const bot = new Bot({
  token: Constants.fb.PAGE_TOKEN,
  verify: Constants.fb.VERIFY_TOKEN,
});

bot.on('error', (err) => {
  console.error('error occurred', err); // eslint-disable-line no-console
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
  getReply().then(results => reply(results, console.error)); // eslint-disable-line no-console
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
      console.error(err); // eslint-disable-line no-console
      return reply({ text: 'Sorry something went wrong :(' }, console.log); // eslint-disable-line no-console
    });
});

export default function () {
  return bot.middleware();
}
