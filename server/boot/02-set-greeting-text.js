'use strict';

const GreetingTextController = require('../controllers/greeting-text.controller');

const { greetingText } = require('../bot-config');

module.exports = () => {
  return GreetingTextController.set(greetingText)
    .then(console.log).catch(console.error);
};
