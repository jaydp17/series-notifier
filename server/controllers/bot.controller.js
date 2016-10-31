import Promise from 'bluebird';
import moment from 'moment';

import { models as Models } from '../server';
import TraktController from './trakt.controller';
import MsgController from './msg.controller';
import ProfileController from './profile.controller';
import BotConfig from '../bot-config';

// coz es6 module import/export don't load json files
const Constants = require('../constants.json');

const Actions = Constants.Actions;
const ButtonTexts = Constants.ButtonTexts;

export default class BotController {

  /**
   * Called when a user msgs something to the bot
   * @param senderId The social id of the sender
   * @param text The message that the user sent
   * @returns {Promise}
   */
  static onMessage(/* string */ senderId, /* string */ text) {
    return TraktController.search(text)
      .filter(series => series.running)
      .then(seriesList => BotController.showSeriesAccToSubscription(seriesList, senderId));
  }

  /**
   * Takes a list of Series and shows them in a carousel,
   * with respect to the subscriptions that a user has.
   * For Eg. if the list contains BBT & Suits, and let's say the user is already
   * subscribed to  BBT, then it will show UN-SUBSCRIBE under BBT & SUBSCRIBE under Suits
   * @param seriesList The list of series to show
   * @param senderId The social id of the sender
   * @returns {Promise}
   */
  static showSeriesAccToSubscription(/* Array<Series> */ seriesList, /* string */ senderId) {
    return Promise.props({
      seriesList,
      subscribedList: Models.User.myShows(senderId),
    }).then((/* {seriesList, subscribedList} */ result) => {
      const { seriesList, subscribedList } = result; // eslint-disable-line no-shadow
      const actionList = new Array(seriesList.length).fill(Actions.SUBSCRIBE);
      const buttonTextList = new Array(seriesList.length).fill(ButtonTexts.SUBSCRIBE);
      subscribedList.forEach((series) => {
        const index = seriesList.findIndex(item => item.tvDbId === series.tvDbId);

        // mark subscribed series, & show un-subscribe button
        if (index !== -1) {
          actionList[index] = Actions.UN_SUBSCRIBE;
          buttonTextList[index] = ButtonTexts.UN_SUBSCRIBE;
        }
      });
      return MsgController.carousel(seriesList, actionList, buttonTextList);
    });
  }

  /**
   * Called when the user clicks a button
   * @param senderId Social Id of the user (in Fb case, the senderId)
   * @param action Action associated with the button
   * @param series The series on which the action was performed
   * @returns {Promise}
   */
  static onPostBack(/* string */ senderId, /* string */ action, /* Series */ series) {
    switch (action) {
      case Actions.GET_STARTED:
        return BotController.getStarted(senderId);

      case Actions.SUBSCRIBE:
        return BotController.subscribe(senderId, series);

      case Actions.UN_SUBSCRIBE:
        return BotController.unSubscribe(senderId, series);

      case Actions.MY_SHOWS:
        return BotController.myShows(senderId);

      case Actions.SHOW_TRENDING:
        return BotController.showTrending(senderId);

      case Actions.NEXT_EP_DATE:
        return BotController.nextEpisodeDate(series);

      default:
        return Promise.reject('unknown action');
    }
  }

  /**
   * Called when the user clicks a quick reply
   * @param senderId Social Id of the user (in Fb cas, the senderId)
   * @param action Action associated with the button
   * @returns {Promise}
   */
  static onQuickReply(/* string */ senderId, /* string */ action) {
    switch (action) {
      case Actions.I_WILL_SEARCH:
        return BotController.searchMessage();

      default:
        return Promise.reject('unknown action');
    }
  }

  /**
   * Gets called when the 'Get Started' button is clicked
   * @param senderId Social Id of the user (in Fb case, the senderId)
   * @returns {Promise.<{text: string, quick_replies: Array}>}
   */
  static getStarted(/* string */ senderId) {
    return ProfileController.get(senderId)
      .then(profile => ({
        text: `Hey ${profile.first_name}!\n` +
        'Would you like to see some trending series\' you can subscribe to?',
        quick_replies: BotConfig.quickReplies.getStarted,
      }));
  }

  /**
   * Message to show when the user clicks "I'll search"
   * @returns {Promise.<{text: string}>}
   */
  static searchMessage() {
    return Promise.resolve({
      text: 'Cool! Just type the name of the series & I\'ll search it for you',
    });
  }

  /**
   * Subscribes to a given series
   * @param senderId Social Id of the user (in Fb case, the senderId)
   * @param series The series to subscribe
   * @returns {Promise.<string>}
   */
  static subscribe(/* string */ senderId, /* Series */ series) {
    return Models.User.addSubscription(senderId, series)
      .then(() => ({ text: `Subscribed to ${series.name}` }));
  }

  /**
   * Un-Subscribes from a series
   * @param senderId Social Id of the user (in Fb case, the senderId)
   * @param series The series to un-subscribe from
   * @returns {Promise.<string>}
   */
  static unSubscribe(/* string */ senderId, /* Series */ series) {
    return Models.User.removeSubscription(senderId, series)
      .then(() => ({ text: `Un-subscribed from ${series.name}` }));
  }

  /**
   * Returns all the shows subscribed by a user
   * @param senderId Social Id of the user requesting
   * @returns {Promise}
   */
  static myShows(/* string */ senderId) {
    return Models.User.myShows(senderId)
      .then((seriesList) => {
        if (seriesList.length === 0) {
          return { text: 'Sorry, you haven\'t subscribed to any shows yet' };
        }
        const actionList = new Array(seriesList.length).fill(Actions.UN_SUBSCRIBE);
        const buttonTextList = new Array(seriesList.length).fill(ButtonTexts.UN_SUBSCRIBE);
        return MsgController.carousel(seriesList, actionList, buttonTextList);
      });
  }

  /**
   * Returns all the Trending shows
   * @param senderId Social Id of the user requesting
   * @returns {Promise.<Series>}
   */
  static showTrending(/* string */ senderId) {
    return Models.Trending.get()
      .then(seriesList => BotController.showSeriesAccToSubscription(seriesList, senderId));
  }

  static nextEpisodeDate(/* Series */ series) {
    // eslint-disable-next-line max-len
    const unknownEpMsg = { text: `Sorry, I don't know the exact release date of ${series.name}'s next episode.` };
    return TraktController.getNextEpisode(series.imdbId)
      .then((nextEp) => {
        if (!nextEp) return unknownEpMsg;
        const epNumber = (`00${nextEp.number}`).slice(-2);
        const seriesNumber = (`00${nextEp.season}`).slice(-2);
        const timeDiff = moment(nextEp.first_aired).fromNow();
        return {
          text: `S${seriesNumber}E${epNumber} of ${series.name} goes live ${timeDiff}`,
        };
      })
      .catch(() => {
        console.error('unknown next episode:', series.imdbId); // eslint-disable-line no-console
        return unknownEpMsg;
      });
  }

}
