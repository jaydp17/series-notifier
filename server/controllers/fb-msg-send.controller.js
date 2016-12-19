// @flow

import request from 'request-promise';
import * as FbConstants from '../fb-constants';

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
