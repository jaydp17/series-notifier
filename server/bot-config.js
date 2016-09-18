'use strict';

const Constants = require('./constants.json');
const Actions = Constants.Actions;
const ButtonTexts = Constants.ButtonTexts;

module.exports = {
  greetingText: 'This bot notifies you when the next episode of your favorite Tv Series airs',
  persistentMenu: {
    myShows: {
      type: 'postback',
      title: ButtonTexts.MY_SHOWS,
      payload: JSON.stringify({ action: Actions.MY_SHOWS }),
    },
    help: {
      type: 'postback',
      title: ButtonTexts.HELP,
      payload: JSON.stringify({ action: Actions.HELP }),
    },
  },
};
