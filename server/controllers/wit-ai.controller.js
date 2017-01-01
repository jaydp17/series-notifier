// @flow

import Promise from 'bluebird';
import { Wit } from 'node-wit';
import fireRequest from '../utils/fire-request';
import { witAIToken } from '../utils/environment';
import CustomError from '../utils/custom-error';
import { Intents, Entities } from '../wit-config';

export type WitParsed = {
  intent: string,
  series: ?string,
};

const witClient = new Wit({ accessToken: witAIToken });

export default class WitAIController {

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

  static async parse(text: string): Promise<WitParsed> {
    const data = await witClient.message(text, {});
    const { intent, series } = data.entities;

    if (intent && intent.length === 0) {
      return undefined;
    }
    const result = {
      intent: intent[0].value,
    };

    switch (result.intent) {
      case Intents.nextEpisode:
        if (series && series.length !== 0) {
          result.series = series[0].value;
        }
        return result;
      default:
        throw new CustomError('Unknown Intent from Wit.AI', data);
    }
  }

}
