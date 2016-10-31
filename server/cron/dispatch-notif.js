'use strict';

process.env.CRON = 1;

const Promise = require('bluebird');
const app = require('../server');
const FbMsgSendController = require('../controllers/fb-msg-send.controller');
const Models = app.models;

const now = Date.now();
const MINUTE = 60 * 1000;

/**
 * Find users subscribed to a series
 * @param imdbId IMDB id of the series
 * @returns {Promise<Array>}
 */
function findUsers(imdbId) {
  return Models.Series.findOne({ where: { imdbId }, include: 'users' })
    .then(ep => ep.users());
}

/**
 * Finds series from IMDB id
 * @param imdbId IMDB id of the series
 * @returns {Promise}
 */
function findSeries(/* string */ imdbId) {
  return Models.Series.findOne({ where: { imdbId } });
}

/**
 * Process each series
 * @returns {Promise}
 */
function processEpisode(episode) {
  return Promise.join(
    findUsers(episode.imdbId),
    findSeries(episode.imdbId),
    (users, series) => {
      return Promise.map(users, (user) => dispatchNotif(user, series, episode));
    });
}

/**
 * Dispatch a notification to each subscribed user
 * @returns {Promise}
 */
function dispatchNotif(user, series, episode) {
  const epNumber = ('00' + episode.number).slice(-2);
  const seriesNumber = ('00' + episode.season).slice(-2);
  return FbMsgSendController.send(user.socialId, {
    text: `${series.name} S${seriesNumber}E${epNumber} is live`,
  });
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
  .then(console.log).catch(console.error)
  .then(() => process.exit(0));
