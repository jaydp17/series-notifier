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

bot.on('message', (/* {sender, message} */ payload, reply) => {
  /** @type {{text, is_echo, quick_reply}} */
  const { message } = payload;
  const text = (message.text || '').trim();
  if (message.is_echo || !text) return;

  const senderId = payload.sender.id;

  let result;
  if (message.quick_reply) {
    const quickReply = JSON.parse(message.quick_reply.payload);
    result = BotController.onQuickReply(senderId, quickReply.action);
  } else {
    result = BotController.onMessage(senderId, text);
  }
  result.then(results => reply(results, console.error)); // eslint-disable-line no-console
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
    .then(result => reply(result, console.log)); // eslint-disable-line no-console
});

export default function () {
  return bot.middleware();
}
