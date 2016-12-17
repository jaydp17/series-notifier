import request from 'request-promise';
import app from '../server';

const FbConstants = app.get('fb');

const fireRequest = options => request(options).promise();

class MessengerApi {

  static sendMessage(senderId, msgObj) {
    const options = {
      method: 'POST',
      url: `${FbConstants.GRAPH_API_URL}/me/messages`,
      qs: {
        access_token: FbConstants.PAGE_TOKEN,
      },
      json: {
        recipient: {
          id: senderId,
        },
        message: msgObj,
      },
    };
    return fireRequest(options);
  }

  static sendText(text, senderId) {
    const options = {
      method: 'POST',
      url: `${FbConstants.GRAPH_API_URL}/me/messages`,
      qs: {
        access_token: FbConstants.PAGE_TOKEN,
      },
      json: {
        recipient: {
          id: senderId,
        },
        message: { text },
      },
    };
    return fireRequest(options);
  }

}

module.exports = MessengerApi;
