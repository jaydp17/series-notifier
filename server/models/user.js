'use strict';

module.exports = function (User) {
  User.addSubscription = (/*string*/ socialId, /*Series*/ series) => {
    const { tvDbId } = series;
    return Promise.join(
      User.app.models.Series.findOrCreate({ where: { tvDbId } }, series),
      User.findOrCreate({ where: { socialId } }, { socialId }),
      ([ seriesObj ], [ userObj ]) => userObj.subscriptions.add(seriesObj)
    );
  };

  User.removeSubscription = (/*string*/ socialId, /*Series*/ series) => {
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
  User.myShows = (/*string*/ socialId) => {
    return User.findOne({ where: { socialId }, include: 'subscriptions' })
      .call('toJSON')
      .then((/*{subscriptions}*/ result) => result.subscriptions);
  };
};
