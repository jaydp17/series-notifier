'use strict';

const Promise = require('bluebird');

const TraktController = require('./trakt.controller');
const MsgController = require('./msg.controller');
const Actions = require('../constants.json').Actions;

class BotController {

  /**
   * Called when a user msgs something to the bot
   * @param text The message that the user sent
   * @returns {Promise}
   */
  static onMessage(/*string*/ text) {
    return TraktController.search(text)
      .filter(series => series.running)
      .then(seriesList => MsgController.carousel(seriesList));
  }

  /**
   * Called when the user clicks a button
   * @param action Action associated with the button
   * @param series The series on which the action was performed
   * @returns {Promise}
   */
  static onPostBack(/*string*/ action, /*Series*/ series) {
    switch (action) {
      case Actions.SUBSCRIBE:
        return BotController.subscribe(series);

      case Actions.UN_SUBSCRIBE:
        return BotController.unSubscribe(series);

      default:
        return Promise.reject('unknown action');
    }
  }

  /**
   * Subscribes to a given series
   * @param series The series to subscribe
   * @returns {Promise.<string>}
   */
  static subscribe(/*Series*/ series) {
    return Promise.resolve(`Subscribed to ${series.name}`);
  }

  /**
   * Un-Subscribes from a series
   * @param series The series to un-subscribe from
   * @returns {Promise.<string>}
   */
  static unSubscribe(/*Series*/ series) {
    return Promise.resolve(`Un-subscribed from ${series.name}`);
  }

}

module.exports = BotController;
