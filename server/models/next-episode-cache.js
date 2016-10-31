import TraktController from '../controllers/trakt.controller';

export default function (NextEpisodeCache) {
  NextEpisodeCache.ensureExists = function (/* string */ imdbId) {
    return NextEpisodeCache.count({ imdbId })
      .then((exists) => {
        if (!exists) {
          return NextEpisodeCache.updateSeries(imdbId);
        }
        return undefined;
      });
  };

  NextEpisodeCache.updateSeries = function (/* string */ imdbId) {
    return TraktController.getNextEpisode(imdbId)
      .tap(episode => episode.imdbId = imdbId) // eslint-disable-line no-return-assign
      .tap(() => NextEpisodeCache.destroyAll({ imdbId }))
      .then(episode => NextEpisodeCache.create(episode))
      // eslint-disable-next-line no-console
      .catch(err => console.error(err)); // called when there's no next episode
  };
}
