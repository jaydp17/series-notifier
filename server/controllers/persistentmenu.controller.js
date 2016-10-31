import request from 'request-promise';

const FbConstants = require('../constants.json').fb;

export default class PersistentMenu {

  static set(/* Array<{type, title, payload}> */ buttons) {
    const options = {
      method: 'POST',
      url: 'https://graph.facebook.com/v2.6/me/thread_settings',
      qs: {
        access_token: FbConstants.PAGE_TOKEN,
      },
      json: {
        setting_type: 'call_to_actions',
        thread_state: 'existing_thread',
        call_to_actions: buttons,
      },
    };
    return request(options);
  }

  static remove() {
    const options = {
      method: 'DELETE',
      url: 'https://graph.facebook.com/v2.6/me/thread_settings',
      qs: {
        access_token: FbConstants.PAGE_TOKEN,
      },
      json: {
        setting_type: 'call_to_actions',
        thread_state: 'existing_thread',
      },
    };
    return request(options);
  }

}
