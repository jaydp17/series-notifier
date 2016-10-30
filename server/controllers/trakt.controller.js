'use strict';

const Promise = require('bluebird');
const _object = require('lodash/object');
const _array = require('lodash/array');
const TraktApi = require('./trakt.api');

const TvDbController = require('./tvdb.controller');

class TraktController {

  /**
   * Searches Tv Shows based on the query provided
   * @param query A piece of text that is matched against the title of the Tv Show
   * @return {Promise<Array<Series>>}
   */
  static search(/*string*/ query) {
    return TraktApi.searchShow(query)
      .map((/*{show}*/ result) => result.show)
      .filter((/*{title, year, status}*/ show) => show.title && show.year && show.status)
      .map((/*{ids: {tvdb}}*/ show) => show.ids.tvdb)
      .filter(id => id) // remove null/undefined ids
      .then(ids => _array.uniq(ids)) // make them unique
      .then(TvDbController.getSeriesByIds)
      .then(TvDbController._sortShowsByRunning);
  }

  /**
   * Returns the next episode of a Tv Show
   * @param imdbId IMDB ID of the Tv Show
   * @return {Promise<TraktEpisode>}
   */
  static getNextEpisode(/*string*/ imdbId) {
    return TraktApi.nextEpisode(imdbId)
      .then((episode) => {
        if (!episode) return Promise.reject('next episode unknown');
        return TraktApi.episodeSummary(imdbId, episode.season, episode.number);
      })
      .then(TraktController._keepOnlyRequiredFields)
      .then(TraktController._correctEmptyFields)
      .then(episode => {
        TraktController._convertAirDate(episode);
        return episode;
      });
  }

  /**
   * Keeps only those fields that are required
   * @param episode Episode Details
   * @return {TraktEpisode}
   * @private
   */
  static _keepOnlyRequiredFields(episode) {
    if (!episode) return episode;
    episode = _object.pick(episode, ['season', 'number', 'title', 'overview', 'first_aired']);
    return episode;
  }

  /**
   * Fills in default values in empty fields
   * @param episode Episode Information
   * @return {TraktEpisode}
   * @private
   */
  static _correctEmptyFields(/*TraktEpisode*/ episode) {
    if (!episode) return episode;
    episode.title = episode.title ? episode.title : `Episode ${episode.number}`;
    return episode;
  }

  /**
   * Converts '2016-04-25T02:00:00.000Z' to Date Object
   * @param season Season Object
   * @return {undefined}
   */
  static _convertAirDate(/*{first_aired}*/ season) {
    season.first_aired = (season.first_aired) ? new Date(season.first_aired) : null;
  }

}

module.exports = TraktController;
