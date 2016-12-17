// @flow

import request from 'request-promise';
import config from '../config'; // eslint-disable-line import/extensions

export default class GreetingTextController {
  static set(text: string) {
    const options = {
      method: 'POST',
      url: `${config.fb.GRAPH_API_URL}/me/thread_settings`,
      qs: {
        access_token: config.fb.PAGE_TOKEN,
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
      url: `${config.fb.GRAPH_API_URL}/me/thread_settings`,
      qs: {
        access_token: config.fb.PAGE_TOKEN,
      },
      json: {
        setting_type: 'greeting',
      },
    };
    return request(options);
  }
}
