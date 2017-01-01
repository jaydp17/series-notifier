// @flow

import Promise from 'bluebird';
import request from 'request-promise';
import { nextEpisode, searchSeries } from '../utils/form-sentences';
import seriesDump from '../bin/wit-dump/series-dump';


const token: string = process.env.WITAI_TOKEN || '';
if (!token) {
  console.error('Pass WITAI_TOKEN as an env variable'); // eslint-disable-line no-console
  process.exit(1);
}

const Intents = {
  nextEpisode: 'next-episode',
  search: 'search',
};

function flattenArray(finalArray, eachArray) {
  return finalArray.concat(eachArray);
}

function setExpressions(name: string, expressions: Array<string>): Promise<any> {
  return Promise.resolve(expressions)
    .map(expression => ({
      url: `https://api.wit.ai/entities/intent/values/${name}/expressions`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      json: { expression },
    }))
    .map(options => request(options), { concurrency: 50 });
}

async function main() {
  const seriesNames = seriesDump
    .map(s => s.expressions)
    .reduce(flattenArray, []);

  const nextEpisodeSentences = seriesNames
    .map(nextEpisode)
    .reduce(flattenArray, []);

  const searchSentences = seriesNames
    .map(searchSeries)
    .reduce(flattenArray, []);

  await setExpressions(Intents.nextEpisode, nextEpisodeSentences);
  await setExpressions(Intents.search, searchSentences);
}

main();
