// @flow

import Promise from 'bluebird';

import TraktController from '../controllers/trakt.controller';
import type { NextEpisodeCacheModel } from '../../flow-declarations/loopback-models';

export type NextEpisodeCache = {
  imdbId: string,
  tvDbId: number,
  season: number,
  number: number,
  title: string,
  overview: string,
  first_aired: Date,
};

export default function (NextEpisodeCache: NextEpisodeCacheModel) { // eslint-disable-line no-shadow
  NextEpisodeCache.ensureExists = function (imdbId: string): Promise<NextEpisodeCache> {
    return NextEpisodeCache.findOne({ where: { imdbId } })
      .then((episode) => {
        if (!episode) {
          return NextEpisodeCache.updateSeries(imdbId);
        }
        return episode;
      });
  };

  NextEpisodeCache.updateSeries = function (imdbId: string): Promise<NextEpisodeCache> {
    return TraktController.getNextEpisode(imdbId)
      .tap(episode => episode.imdbId = imdbId) // eslint-disable-line no-return-assign
      .tap(() => NextEpisodeCache.destroyAll({ imdbId }))
      .then(episode => NextEpisodeCache.create(episode))
      // eslint-disable-next-line no-console
      .catch(err => console.error(err)); // called when there's no next episode
  };
}
