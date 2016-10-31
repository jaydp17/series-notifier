// @flow

import Promise from 'bluebird';
import _object from 'lodash/object';
import _array from 'lodash/array';

import TraktApi from './trakt.api';
import TvDbController from './tvdb.controller';
import type { Series, TraktEpisode } from '../models/series';

export default class TraktController {

  /**
   * Searches Tv Shows based on the query provided
   * @param query A piece of text that is matched against the title of the Tv Show
   */
  static search(query: string): Promise<Array<Series>> {
    return TraktApi.searchShow(query)
      .map(result => result.show)
      .filter(show => show.title && show.year && show.status)
      .map(show => show.ids.tvdb)
      .filter(id => id) // remove null/undefined ids
      .then(ids => _array.uniq(ids)) // make them unique
      .then(TvDbController.getSeriesByIds)
      .then(TvDbController._sortShowsByRunning);
  }

  /**
   * Returns the next episode of a Tv Show
   * @param imdbId IMDB ID of the Tv Show
   */
  static getNextEpisode(imdbId: string): Promise<TraktEpisode> {
    return TraktApi.nextEpisode(imdbId)
      .then((episode) => {
        if (!episode) return Promise.reject('next episode unknown');
        return TraktApi.episodeSummary(imdbId, episode.season, episode.number);
      })
      .then(TraktController._keepOnlyRequiredFields)
      .then(TraktController._correctEmptyFields)
      .then((episode) => {
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
  static _keepOnlyRequiredFields(episode): TraktEpisode {
    if (!episode) return episode;
    return _object.pick(episode, [ 'season', 'number', 'title', 'overview', 'first_aired' ]);
  }

  /**
   * Fills in default values in empty fields
   * @param episode Episode Information
   * @private
   */
  static _correctEmptyFields(episode: TraktEpisode): TraktEpisode {
    if (!episode) return episode;
    episode.title = episode.title ? episode.title : `Episode ${episode.number}`;
    return episode;
  }

  /**
   * Converts '2016-04-25T02:00:00.000Z' to Date Object
   * @param season Season Object
   */
  static _convertAirDate(season: TraktEpisode): ?TraktEpisode {
    season.first_aired = (season.first_aired) ? new Date(season.first_aired) : null;
  }

}
