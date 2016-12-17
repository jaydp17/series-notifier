// @flow

import request from 'request-promise';
import config from '../config'; // eslint-disable-line import/extensions

export default class FbMsgSendController {

  static send(senderId: string, message) {
    const options = {
      method: 'POST',
      url: `${config.fb.GRAPH_API_URL}/me/messages`,
      qs: {
        access_token: config.fb.PAGE_TOKEN,
      },
      json: {
        recipient: { id: senderId },
        message,
      },
    };
    return request(options);
  }
}
