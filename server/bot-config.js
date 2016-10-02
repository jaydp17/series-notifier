'use strict';

const Constants = require('./constants.json');
const Actions = Constants.Actions;
const ButtonTexts = Constants.ButtonTexts;

module.exports = {
  greetingText: 'This bot notifies you when the next episode of your favorite Tv Series airs',
  getStartedButton: {
    payload: JSON.stringify({ action: Actions.GET_STARTED }),
  },
  persistentMenu: {
    showTrending: {
      type: 'postback',
      title: ButtonTexts.SHOW_TRENDING,
      payload: JSON.stringify({ action: Actions.SHOW_TRENDING }),
    },
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
  quickReplies: {
    getStarted: [
      {
        content_type: 'text',
        title: 'Yo! show trending',
        payload: JSON.stringify({ action: Actions.SHOW_TRENDING }),
      },
      {
        content_type: 'text',
        title: 'No! I\'ll search',
        payload: JSON.stringify({ action: Actions.I_WILL_SEARCH }),
      },
    ],
  },
};
