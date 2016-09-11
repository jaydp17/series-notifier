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
};
