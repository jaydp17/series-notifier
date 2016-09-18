'use strict';

const request = require('request-promise');

const FbConstants = require('../constants.json').fb;

class ProfileController {

  /**
   * Gets the profile of the sender
   * @param fbSenderId
   * @returns {Promise.<{first_name, last_name, profile_pic, locale, timezone, gender}>}
   */
  static get(/* string */ fbSenderId) {
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

module.exports = ProfileController;
