'use strict';

/**
 * @typedef {
 *
 * {
 *   imdbId,
 *   tvDbId,
 *   name,
 *   genre,
 *   running,
 *   rating,
 *   length,
 *   poster,
 *   fanArt
 * }
 *
 * } Series
 */

/**
 * @typedef {
 *
 * {
 *   season,
 *   number,
 *   title,
 *   ids: {trakt,tvdb, imdb, tmdb},
 *   overview,
 *   first_aired,
 *   totalEpisodes
 * }
 *
 * } TraktEpisode
 */

/**
 * @typedef {
 *
 * {
 *   number,
 *   ids: {trakt,tvdb, imdb, tmdb},
 *   episode_count,
 *   aired_episodes,
 *   overview,
 *   first_aired,
 *   episodes: Array<TraktEpisode>
 * }
 *
 * } TraktSeason
 */

module.exports = {};
