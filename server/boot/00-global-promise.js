// @flow

import Promise from 'bluebird';

export default function () {
  global.Promise = Promise;
}
