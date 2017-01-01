// @flow

import Promise from 'bluebird';
import request from 'request-promise';
import seriesDump from '../bin/wit-dump/series-dump';


const token: string = process.env.WITAI_TOKEN || '';
if (!token) {
  console.error('Pass WITAI_TOKEN as an env variable'); // eslint-disable-line no-console
  process.exit(1);
}

const Entities = {
  series: 'series',
};

Promise.resolve(seriesDump)
  .map(obj => ({
    url: `https://api.wit.ai/entities/${Entities.series}/values`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    json: obj,
  }))
  .map(options => request(options)
    .catch((err) => {
      // suppress A value already exists with this name, error
      if (err.statusCode !== 409) {
        throw err;
      }
    })
  )
  .then(() => console.log('done!'));
