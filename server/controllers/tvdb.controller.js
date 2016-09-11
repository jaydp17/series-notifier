'use strict';

const TVDB = require('node-tvdb');
const Promise = require('bluebird');

const ApiKeys = require('../constants.json').ApiKeys;

const tvdb = new TVDB(ApiKeys.TVDB);

/**
 * A class that interacts with TvDb to fetch information
 * Note : In Search TvDbId is used instead of the standard IMDB_ID as searching TvDb using TvDbId
 * results is much more information compared to search using IMDB_ID
 */
class TvDbController {

  /**
   * Searches Tv Shows based on the query provided
   * @param query A piece of text that is matched against the title of the Tv Show
   * @return {Promise<Array<Series>>}
   * @see {@link TraktController#search(string)}
   * @deprecated
   */
  static search(/*string*/ query) {
    return TvDbController._getSeriesByName(query)
      .then(this._catchEmptyData)
      .map((/*{id}*/ show) => show.id)
      .then(this.getSeriesByIds)
      .then(this._sortShowsByRunning);
  }

  /**
   * A method that makes a call to TVDB and fires a search query
   * @param query Text to search
   * @return {Promise}
   */
  static _getSeriesByName(/*string*/ query) {
    return Promise.resolve(tvdb.getSeriesByName(query));
  }

  /**
   * Returns Tv Shows based on TvDb IDs
   * @param tvDbIds An Array of TvDb Ids
   * @return {Promise<Array<Series>>}
   */
  static getSeriesByIds(/*Array<string>*/ tvDbIds) {
    return Promise.map(tvDbIds, id => TvDbController._getSeriesById(id))
      .filter(TvDbController._filterData)
      .map(TvDbController._parseData);
  }

  /**
   * Queries TvDb server for the result
   * @param tvDbId A Single TvDb Id string
   * @return {Promise}
   * @private
   */
  static _getSeriesById(/*string*/ tvDbId) {
    return tvdb.getSeriesById(tvDbId)
      .catch(err => console.error(err, `error loading tvDbId: ${tvDbId}`));
  }

  /**
   * Sometimes TvDb returns null if there's no Tv Show matching the search query
   * This method converts that null to an empty array
   * @param results TvDb Search Results
   * @return {Array}
   */
  static _catchEmptyData(results) {
    return results === null ? [] : results;
  }

  /**
   * Filters shows that don't have basic data filled in
   * @param data Data Received from TvDb
   * @return {boolean}
   */
  static _filterData(/*{id, IMDB_ID, SeriesName, Genre, Status, Runtime, Rating, poster}*/ data) {
    if (!data) return false;
    return data.id && data.IMDB_ID && data.SeriesName && data.Genre && data.Status
      && data.Runtime && data.Rating && data.poster && true;
  }

  /**
   * Parses Data from TvDb to data that the Client app can understand
   * @param data Data Received from TvDb
   * @return {Series}
   */
  static _parseData(/*{id, IMDB_ID, SeriesName, Genre, Status, Runtime, Rating, poster, fanart}*/
                    data) {
    return {
      imdbId: data.IMDB_ID,
      tvDbId: data.id,
      name: data.SeriesName,
      genre: TVDB.utils.parsePipeList(data.Genre),
      running: data.Status === 'Continuing',
      rating: data.Rating,
      length: data.Runtime,
      poster: `http://thetvdb.com/banners/_cache/${data.poster}`,
      fanArt: `http://thetvdb.com/banners/${data.fanart}`
    };
  }

  /**
   * Arranges the currently running shows on the top
   * @param shows An array of Tv Shows to sort
   * @return {Array.<Series>}
   */
  static _sortShowsByRunning(/*Array<Series>*/ shows) {
    return shows.sort((a, b) => b.running - a.running);
  }
}

// Promise.delay(1000)
//   .then(() => TvDbController.getSeriesByIds(['279121']))
//   .then(console.log).catch(console.error);

module.exports = TvDbController;
