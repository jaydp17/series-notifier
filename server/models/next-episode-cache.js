'use strict';

const TraktController = require('../controllers/trakt.controller');

module.exports = function (NextEpisodeCache) {
  NextEpisodeCache.ensureExists = function (/* string */ imdbId) {
    return NextEpisodeCache.count({ imdbId })
      .then(exists => {
        if (!exists) {
          return NextEpisodeCache.updateSeries(imdbId);
        }
      });
  };

  NextEpisodeCache.updateSeries = function (/* string */ imdbId) {
    return TraktController.getNextEpisode(imdbId)
      .tap((/* TraktEpisode */ episode) => episode.imdbId = imdbId)
      .tap(() => NextEpisodeCache.destroyAll({ imdbId }))
      .then((/* TraktEpisode */ episode) => NextEpisodeCache.create(episode))
      .catch(err => console.error(err)); // called when there's no next episode
  };
};
