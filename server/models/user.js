export default function (User) {
  User.addSubscription = function (/* string */ socialId, /* Series */ series) {
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

  User.removeSubscription = function (/* string */ socialId, /* Series */ series) {
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
   * @returns {Promise.<Series>}
   */
  User.myShows = function (socialId) {
    return User.findOne({ where: { socialId }, include: 'subscriptions' })
      .then((/* {subscriptions} */ result) => {
        if (!result) return [];
        return result.subscriptions();
      });
  };
}
