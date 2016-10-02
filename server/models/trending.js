'use strict';

const TraktController = require('../controllers/trakt.controller');
const TvDbController = require('../controllers/tvdb.controller');

module.exports = function (Trending) {
  /**
   * Gets the trending series data from the cache (if exists) or from TraktTV
   * @returns {Promise.<TResult>}
   */
  Trending.get = function () {
    return Trending.find()
      .then((/*Array*/ trending) => {
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
    return TraktController._trendingShowsQuery()
      .map((/*{show: {ids: {tvdb}}}*/ shows) => shows.show.ids.tvdb)
      .then(tvdbIds => TvDbController.getSeriesByIds(tvdbIds))
      .filter((/*Series*/ series) => series.running) // keep only running series
      .then(data => Trending.create(data));
  };
};

