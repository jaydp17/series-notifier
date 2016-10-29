'use strict';

const GetStartedButtonController = require('../controllers/get-started-button.controller');

module.exports = () => {
  if (process.env.CRON) return;
  return GetStartedButtonController.set()
    .then(console.log).catch(console.error);
};
