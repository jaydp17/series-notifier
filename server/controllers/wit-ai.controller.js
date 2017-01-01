// @flow

import Promise from 'bluebird';
import fireRequest from '../utils/fire-request';
import { witAIToken } from '../utils/environment';

const Entities = {
  series: 'series',
};

export default class WitAI {

  static putInFeedback(name: string | Array<string>) {
    let nameArr: Array<string>;
    if (typeof name === 'string') {
      nameArr = [ name ];
    } else {
      nameArr = name;
    }
    return Promise.resolve(nameArr)
      .map(nameStr => ({
        url: `https://api.wit.ai/entities/${Entities.series}/values`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${witAIToken}`,
        },
        json: {
          value: nameStr,
          expressions: [ nameStr ],
        },
      }))
      .map(options => fireRequest(options)
        .catch((err) => {
          // suppress A value already exists with this name, error
          if (err.statusCode !== 409) {
            throw err;
          }
        })
      );
  }

}
