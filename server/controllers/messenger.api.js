import request from 'request-promise';
import config from '../config'; // eslint-disable-line import/extensions

const fireRequest = options => request(options).promise();

class MessengerApi {

  static sendMessage(senderId, msgObj) {
    const options = {
      method: 'POST',
      url: `${config.fb.GRAPH_API_URL}/me/messages`,
      qs: {
        access_token: config.fb.PAGE_TOKEN,
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
      url: `${config.fb.GRAPH_API_URL}/me/messages`,
      qs: {
        access_token: config.fb.PAGE_TOKEN,
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
