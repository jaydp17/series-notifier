// @flow

import TvDbController from '../controllers/tvdb.controller';
import TraktApi from '../controllers/trakt.api';
import WitAI from '../controllers/wit-ai.controller';
import type { TrendingModel } from '../../flow-declarations/loopback-models';

export default function (Trending: TrendingModel) {
  /**
   * Gets the trending series data from the cache (if exists) or from TraktTV
   * @returns {Promise}
   */
  Trending.get = function () {
    return Trending.find()
      .then((trending) => {
        if (!trending.length) {
          return Trending.updateTrendingData();
        }
        return trending;
      });
  };

  /**
   * Updates the Trending Series in Db
   * @return {Promise}
   */
  Trending.updateTrendingData = function () {
    return TraktApi.showTrending()
      .map(shows => shows.show.ids.tvdb)
      .then(tvdbIds => TvDbController.getSeriesByIds(tvdbIds))
      .tap((seriesList) => {
        const seriesNames = seriesList.map(s => s.name);
        WitAI.putInFeedback(seriesNames); // intentionally not returned promise, to return response to user faster
      })
      .filter(series => series.running) // keep only running series
      .map((data) => {
        data.createdAt = new Date();
        return data;
      })
      .then(data => Trending.create(data));
  };
}
