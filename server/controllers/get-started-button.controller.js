'use strict';

const request = require('request-promise');

const FbConstants = require('../constants.json').fb;

const { getStartedButton } = require('../bot-config');

class GetStartedButtonController {

  static set() {
    const options = {
      method: 'POST',
      url: `${FbConstants.GRAPH_API_URL}/me/thread_settings`,
      qs: {
        access_token: FbConstants.PAGE_TOKEN,
      },
      json: {
        setting_type: 'call_to_actions',
        thread_state: 'new_thread',
        call_to_actions: [ getStartedButton ],
      },
    };
    return request(options);
  }

  static remove() {
    const options = {
      method: 'DELETE',
      url: `${FbConstants.GRAPH_API_URL}/me/thread_settings`,
      qs: {
        access_token: FbConstants.PAGE_TOKEN,
      },
      json: {
        setting_type: 'call_to_actions',
        thread_state: 'new_thread',
      },
    };
    return request(options);
  }
}

module.exports = GetStartedButtonController;
