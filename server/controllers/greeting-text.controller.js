// @flow

import request from 'request-promise';
import * as FbConstants from '../fb-constants';

export default class GreetingTextController {
  static set(text: string) {
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
