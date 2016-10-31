// @flow

import Promise from 'bluebird';
import request from 'request-promise';

const apiKey = require('../constants.json').ApiKeys.TRAKT;

const BASE_URL = 'https://api.trakt.tv';
const HEADERS = {
  'trakt-api-version': '2',
  'trakt-api-key': apiKey,
};
const fireRequest = options => request(options).promise();

export default class TraktApi {

  /**
   * Searches the query on Trakt.tv server and returns the raw response
   * @param query The text to search
   * @return {Promise.<*>}
   */
  static searchShow(query: string): Promise<any> {
    const options = {
      method: 'GET',
      url: `${BASE_URL}/search/show`,
      headers: HEADERS,
      json: true,
      qs: {
        extended: 'full',
        query,
      },
    };
    return fireRequest(options);
  }

  static showSeasons(imdbId: string): Promise<any> {
    const options = {
      method: 'GET',
      url: `${BASE_URL}/shows/${imdbId}/seasons`,
      headers: HEADERS,
      json: true,
      qs: {
        extended: 'full',
      },
    };
    return fireRequest(options);
  }

  /**
   * Queries Trakt Server for trending shows
   * @return {Promise}
   */
  static showTrending(): Promise<any> {
    const options = {
      method: 'GET',
      url: `${BASE_URL}/shows/trending`,
      headers: HEADERS,
      json: true,
    };
    return fireRequest(options);
  }

  static nextEpisode(imdbId: string): Promise<any> {
    const options = {
      method: 'GET',
      url: `${BASE_URL}/shows/${imdbId}/next_episode`,
      headers: HEADERS,
      json: true,
    };
    return fireRequest(options);
  }

  static episodeSummary(imdbId: string, seasonNum: number, episodeNum: number): Promise<any> {
    const options = {
      method: 'GET',
      url: `${BASE_URL}/shows/${imdbId}/seasons/${seasonNum}/episodes/${episodeNum}`,
      headers: HEADERS,
      json: true,
      qs: {
        extended: 'full',
      },
    };
    return fireRequest(options);
  }

}
