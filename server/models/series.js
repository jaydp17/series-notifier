

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

export default function () {
}

export type Series = {
  imdbId: string,
  tvDbId: number,
  name: string,
  genre: Array<string>,
  running: boolean,
  rating: string,
  length: number,
  fanArt: string,
}

export type TraktEpisode = {
  season: number,
  number: number,
  title: string,
  overview: string,
  first_aired: Date,
};
