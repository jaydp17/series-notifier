'use strict';

const Bot = require('messenger-bot');
const util = require('util');
const BotController = require('../controllers/bot.controller');

const Constants = require('../constants.json');

const bot = new Bot({
  token: Constants.fb.PAGE_TOKEN,
  verify: Constants.fb.VERIFY_TOKEN,
});

bot.on('error', err => {
  console.error('error occurred', err);
});

bot.on('message', (payload, reply) => {
  const text = (payload.message.text || '').trim();
  if (payload.message.is_echo) return;
  if (!text) return;

  BotController.onMessage(text)
    .then(results => reply(results, console.error));
});

/**
 * Postbacks are back end calls to your webhook when buttons are tapped
 */
bot.on('postback', (payload, reply) => {
  let data = payload.postback.payload;
  data = JSON.parse(data);

  const {action, series} = data;
  BotController.onPostBack(action, series)
    .then(text => reply({text}, console.error));
});

module.exports = function() {
  return bot.middleware();
};
