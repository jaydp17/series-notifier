// @flow

import request from 'request-promise';
import BotConfig from '../bot-config';
import * as FbConstants from '../fb-constants';

export default class GetStartedButtonController {

  static set() {
    const { getStartedButton } = BotConfig;
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
