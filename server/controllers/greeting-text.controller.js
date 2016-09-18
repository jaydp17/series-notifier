'use strict';

const request = require('request-promise');

const FbConstants = require('../constants.json').fb;

class GreetingTextController {
  static set(/* string */ text) {
    const options = {
      method: 'POST',
      url: `${FbConstants.GRAPH_API_URL}/thread_settings`,
      qs: {
        access_token: FbConstants.PAGE_TOKEN,
      },
      json: {
        setting_type: 'greeting',
        greeting: { text },
      },
    };
    return request(options);
  }

  static remove() {
    const options = {
      method: 'DELETE',
      url: `${FbConstants.GRAPH_API_URL}/thread_settings`,
      qs: {
        access_token: FbConstants.PAGE_TOKEN,
      },
      json: {
        setting_type: 'greeting',
      },
    };
    return request(options);
  }
}

module.exports = GreetingTextController;
