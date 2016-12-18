// @flow

import Rx from 'rxjs';
import request from 'request-promise';

import app from '../server';

const FbConstants = app.get('fb');

const fireRequest = options => Rx.Observable.fromPromise(request(options));

class MessengerApi {

  static sendMessage(senderId: string, msgObj: Object): rxjs$Observable<any> {
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

  static sendText(text: string, senderId: string): rxjs$Observable<any> {
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
