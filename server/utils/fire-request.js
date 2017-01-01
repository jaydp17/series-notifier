// @flow

import request from 'request-promise';

export default function (options: Object): Promise<any> {
  return request(options).promise();
}
