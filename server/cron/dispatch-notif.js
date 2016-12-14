// @flow

import Promise from 'bluebird';
import { models as Models } from '../server';
import FbMsgSendController from '../controllers/fb-msg-send.controller';
import * as Logger from '../utils/logger';
import type { Series, TraktEpisode } from '../models/series';
import type { User } from '../models/user';

const now = Date.now();
const MINUTE = 60 * 1000;

/**
 * Find users subscribed to a series
 * @param imdbId IMDB id of the series
 */
function findUsers(imdbId: string): Promise<Array<User>> {
  return Models.Series.findOne({ where: { imdbId }, include: 'users' })
    .then(ep => ep.users());
}

/**
 * Finds series from IMDB id
 * @param imdbId IMDB id of the series
 */
function findSeries(imdbId: string): Promise<Series> {
  return Models.Series.findOne({ where: { imdbId } });
}

/**
 * Dispatch a notification to each subscribed user
 */
function dispatchNotif(user: User, series: Series, episode: TraktEpisode): Promise<{text: string}> {
  const epNumber = (`00${episode.number}`).slice(-2);
  const seriesNumber = (`00${episode.season}`).slice(-2);
  return FbMsgSendController.send(user.socialId, {
    text: `${series.name} S${seriesNumber}E${epNumber} is live`,
  });
}

/**
 * Process each series
 * @returns {Promise}
 */
function processEpisode(episode: TraktEpisode): Promise<any> {
  return Promise.join(
    findUsers(episode.imdbId),
    findSeries(episode.imdbId),
    (users: Array<User>, series: Series) =>
      Promise.map(users, user => dispatchNotif(user, series, episode))
  );
}

/**
 * Main Execution
 */
Models.NextEpisodeCache.find({
  where: {
    first_aired: {
      between: [
        now - (5 * MINUTE),
        now + (10 * MINUTE),
      ],
    },
  },
}).map(processEpisode)
  .then(console.log).catch(Logger.error) // eslint-disable-line no-console
  .then(() => process.exit(0));
