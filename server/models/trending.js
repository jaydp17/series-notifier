'use strict';

const TvDbController = require('../controllers/tvdb.controller');
const TraktApi = require('../controllers/trakt.api');

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
    return TraktApi.showTrending()
      .map((/*{show: {ids: {tvdb}}}*/ shows) => shows.show.ids.tvdb)
      .then(tvdbIds => TvDbController.getSeriesByIds(tvdbIds))
      .filter((/*Series*/ series) => series.running) // keep only running series
      .map(data => {
        data.createdAt = new Date();
        return data;
      })
      .then(data => {
        return Trending.create(data);
      });
  };
};

