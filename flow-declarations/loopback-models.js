import type { Series } from '../server/models/series';
import type { User } from '../server/models/user';
import type { NextEpisodeCache } from '../server/models/next-episode-cache';

declare class PersistedModel<T> {
  app: {
    models: Models,
  };

  find<T>(filter: object): Promise<Array<T>>;
  findOne<T>(filter: object): Promise<T>;
  findOrCreate<T>(filter: object, data: object): Promise;
}

declare class UserModel extends PersistedModel<User> {
  addSubscription: (socialId: string, series: Series) => Promise<any>,
  removeSubscription: (socialId: string, series: Series) => Promise<any>,
  myShows: (socialId: string) => Promise<Array<Series>>,
}

declare class SeriesModel extends PersistedModel<Series> {
}

declare class TrendingModel extends PersistedModel<Series> {
  get(): Promise<Array<Series>>;
  updateTrendingData(): Promise<Array<Series>>;
}

declare class NextEpisodeCacheModel extends PersistedModel<> {
  ensureExists(imdbId: string): Promise<NextEpisodeCache>;
  updateSeries(imdbId: string): Promise<NextEpisodeCache>;
}

declare type Models = {
  Series: SeriesModel,
  User: UserModel,
  NextEpisodeCache: NextEpisodeCacheModel,
}
