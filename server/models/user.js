// @flow

import Promise from 'bluebird';
import type { Series } from './series';
import type { UserModel } from '../../flow-declarations/loopback-models';

export type User = {
  socialId: string,
  subscriptions: () => Array<Series>
}

export default function (User: UserModel) { // eslint-disable-line no-shadow
  User.addSubscription = function (socialId: string, series: Series) {
    const { tvDbId } = series;
    return Promise.join(
      User.app.models.Series.findOrCreate({ where: { tvDbId } }, series),
      User.findOrCreate({ where: { socialId } }, { socialId }),
      ([ seriesObj ], [ userObj ]) => userObj.subscriptions.add(seriesObj)
    ).then(() => {
      // intentionally not returned promise
      User.app.models.NextEpisodeCache.ensureExists(series.imdbId);
    });
  };

  User.removeSubscription = function (socialId: string, series: Series) {
    const { tvDbId } = series;
    return Promise.join(
      User.app.models.Series.findOne({ where: { tvDbId } }),
      User.findOne({ where: { socialId } }),
      (seriesObj, userObj) => userObj.subscriptions.remove(seriesObj)
    );
  };

  /**
   * Returns all the shows subscribed by a user
   * @param socialId Social Id of the user requesting
   */
  User.myShows = function (socialId: string): Promise<Array<Series>> {
    return User.findOne({ where: { socialId }, include: 'subscriptions' })
      .then((result: User) => {
        if (!result) return [];
        return result.subscriptions();
      });
  };
}
