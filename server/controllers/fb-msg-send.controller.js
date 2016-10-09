'use strict';

const request = require('request-promise');
const FbConstants = require('../constants.json').fb;

class FbMsgSendController {

  static send(/* string */ senderId, message) {
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

module.exports = FbMsgSendController;
