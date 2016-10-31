import request from 'request-promise';

const FbConstants = require('../constants.json').fb;

export default class GreetingTextController {
  static set(/* string */ text) {
    const options = {
      method: 'POST',
      url: `${FbConstants.GRAPH_API_URL}/me/thread_settings`,
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
      url: `${FbConstants.GRAPH_API_URL}/me/thread_settings`,
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
