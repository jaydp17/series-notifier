// @flow

import Promise from 'bluebird';
import request from 'request-promise';
import * as FbConstants from '../fb-constants';

export type Profile = {
  first_name: string,
  last_name: string,
  profile_pic: string,
  locale: string,
  timezone: string,
  gender: string,
};

export default class ProfileController {

  /**
   * Gets the profile of the sender
   * @param fbSenderId
   * @returns {Promise.<{first_name, last_name, profile_pic, locale, timezone, gender}>}
   */
  static get(fbSenderId: string): Promise<Profile> {
    const options = {
      method: 'GET',
      url: `${FbConstants.GRAPH_API_URL}/${fbSenderId}`,
      qs: {
        access_token: FbConstants.PAGE_TOKEN,
      },
      json: true,
    };
    return Promise.resolve(request(options));
  }

}
