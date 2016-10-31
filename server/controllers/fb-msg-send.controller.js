// @flow

import request from 'request-promise';

const FbConstants = require('../constants.json').fb;

export default class FbMsgSendController {

  static send(senderId: string, message) {
    const options = {
      method: 'POST',
      url: `${FbConstants.GRAPH_API_URL}/me/messages`,
      qs: {
        access_token: FbConstants.PAGE_TOKEN,
      },
      json: {
        recipient: { id: senderId },
        message,
      },
    };
    return request(options);
  }
}
