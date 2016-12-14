// @flow

import TVDB from 'node-tvdb';
import Promise from 'bluebird';

import * as Logger from '../utils/logger';

import type { Series } from '../models/series';

const ApiKeys = require('../constants.json').ApiKeys;

const tvdb = new TVDB(ApiKeys.TVDB);

/**
 * A class that interacts with TvDb to fetch information
 * Note : In Search TvDbId is used instead of the standard IMDB_ID as searching TvDb using TvDbId
 * results is much more information compared to search using IMDB_ID
 */
export default class TvDbController {

  /**
   * Searches Tv Shows based on the query provided
   * @param query A piece of text that is matched against the title of the Tv Show
   * @return {Promise<Array<Series>>}
   * @see {@link TraktController#search(string)}
   * @deprecated
   */
  static search(query: string): Promise<Array<Series>> {
    return TvDbController._getSeriesByName(query)
      .then(this._catchEmptyData)
      .map(show => show.id)
      .then(this.getSeriesByIds)
      .then(this._sortShowsByRunning);
  }

  /**
   * A method that makes a call to TVDB and fires a search query
   * @param query Text to search
   */
  static _getSeriesByName(query: string): Promise<any> {
    return Promise.resolve(tvdb.getSeriesByName(query));
  }

  /**
   * Returns Tv Shows based on TvDb IDs
   * @param tvDbIds An Array of TvDb Ids
   */
  static getSeriesByIds(tvDbIds: Array<string>): Promise<Array<Series>> {
    return Promise.map(tvDbIds, id => TvDbController._getSeriesById(id))
      .filter(TvDbController._filterData)
      .map(TvDbController._parseData);
  }

  /**
   * Queries TvDb server for the result
   * @param tvDbId A Single TvDb Id string
   * @private
   */
  static _getSeriesById(tvDbId: string): Promise<any> {
    return tvdb.getSeriesById(tvDbId)
      .catch(err => Logger.error(err, { message: `error loading tvDbId: ${tvDbId}` }));
  }

  /**
   * Sometimes TvDb returns null if there's no Tv Show matching the search query
   * This method converts that null to an empty array
   * @param results TvDb Search Results
   * @return {Array}
   */
  static _catchEmptyData(results: Array<any> | null): Array<any> {
    return results === null ? [] : results;
  }

  /**
   * Filters shows that don't have basic data filled in
   * @param data Data Received from TvDb
   */
  static _filterData(/* {id, IMDB_ID, SeriesName, Genre, Status, Runtime, Rating, poster} */ data): boolean {
    if (!data) return false;
    return data.id && data.IMDB_ID && data.SeriesName && data.Genre && data.Status
      && data.Runtime && data.Rating && data.poster && true;
  }

  /**
   * Parses Data from TvDb to data that the Client app can understand
   * @param data Data Received from TvDb
   */
  static _parseData(/* {id, IMDB_ID, SeriesName, Genre, Status, Runtime, Rating, poster, fanart} */ data): Series {
    return {
      imdbId: data.IMDB_ID,
      tvDbId: data.id,
      name: data.SeriesName,
      genre: TVDB.utils.parsePipeList(data.Genre),
      running: data.Status === 'Continuing',
      rating: data.Rating,
      length: data.Runtime,
      poster: `http://thetvdb.com/banners/_cache/${data.poster}`,
      fanArt: `http://thetvdb.com/banners/${data.fanart}`,
    };
  }

  /**
   * Arranges the currently running shows on the top
   * @param shows An array of Tv Shows to sort
   */
  static _sortShowsByRunning(shows: Array<Series>): Array<Series> {
    return shows.sort((a, b) => b.running - a.running);
  }
}
