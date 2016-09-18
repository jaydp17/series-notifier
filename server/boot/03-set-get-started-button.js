'use strict';

const GetStartedButtonController = require('../controllers/get-started-button.controller');

module.exports = () => {
  return GetStartedButtonController.set()
    .then(console.log).catch(console.error);
};
