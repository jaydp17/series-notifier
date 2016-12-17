// @flow

import Promise from 'bluebird';
import moment from 'moment';

import { models as Models } from '../server';
import TraktController from './trakt.controller';
import MsgController from './msg.controller';
import ProfileController from './profile.controller';
import BotConfig from '../bot-config';
import * as Logger from '../utils/logger';
import CustomError from '../utils/custom-error';

import type { Series } from '../models/series';
import type { Carousel } from './msg.controller'; // eslint-disable-line no-duplicate-imports
import type { FbMessage, FbPostBack, FbQuickReply } from '../../flow-declarations/loopback-models';

// coz es6 module import/export don't load json files
const Constants = require('../constants.json');

const Actions = Constants.Actions;
const ButtonTexts = Constants.ButtonTexts;

export default class BotController {

  /**
   * Parses the facebook message object and dispatches the control flow to wherever necessary
   * @param message Message object sent by facebook
   * @param senderId Id of the sender
   * @returns {Promise}
   */
  static processIncoming(message: FbMessage, senderId: string): Promise<any> {
    const text = (message.text || '').trim();
    if (message.is_echo || !text) return Promise.resolve([]);

    if (message.quick_reply) {
      const quickReply = JSON.parse(message.quick_reply.payload);
      return BotController.onQuickReply(senderId, quickReply.action);
    }
    return BotController.onMessage(senderId, text);
  }

  /**
   * Parses the facebook postback object and dispatches the control flow
   * @param postback Postback object sent by facebook
   * @param senderId Id of the sender
   * @returns {Promise}
   */
  static processPostBack(postback: FbPostBack, senderId: string): Promise<any> {
    const payload = JSON.parse(postback.payload);
    if (!payload.action) {
      const error = new CustomError('Action not found in PostBack payload', { payload });
      return Promise.reject(error);
    }
    return BotController.onPostBack(senderId, payload.action, payload.series);
  }

  /**
   * Parses the facebook QuickReply object and dispatches the control flow
   * @param quickReply QuickReply object sent by facebook
   * @param senderId Id of the sender
   * @returns {Promise}
   */
  static processQuickReply(quickReply: FbQuickReply, senderId: string): Promise<any> {
    const payload = JSON.parse(quickReply.payload);
    if (!payload.action) {
      const error = new CustomError('Action not found in QuickReply payload', { payload });
      return Promise.reject(error);
    }
    return BotController.onQuickReply(senderId, payload.action);
  }

  /**
   * Called when a user msgs something to the bot
   * @param senderId The social id of the sender
   * @param text The message that the user sent
   * @returns {Promise}
   */
  static onMessage(senderId: string, text: string): Promise<Carousel> {
    const noSeriesMsg = 'no_series_found';
    return TraktController.search(text)
      .filter(series => series.running)
      .then((seriesList) => {
        if (seriesList.length === 0) {
          return Promise.reject(noSeriesMsg);
        }
        return seriesList;
      })
      .then(seriesList => BotController.showSeriesAccToSubscription(seriesList, senderId))
      .catch((err) => {
        if (err === noSeriesMsg) {
          return { text: 'Sorry, no Series found with that name :/' };
        }
        Logger.error(err);
        return { text: 'Sorry something went wrong :/' };
      });
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
  static showSeriesAccToSubscription(seriesList: Array<Series>, senderId: string): Promise<Carousel> {
    return Promise.props({
      seriesList,
      subscribedList: Models.User.myShows(senderId),
    }).then((result: { seriesList: Array<Series>, subscribedList: Array<Series> }) => {
      const { seriesList, subscribedList } = result; // eslint-disable-line no-shadow
      const actionList = new Array(seriesList.length).fill(Actions.SUBSCRIBE);
      const buttonTextList = new Array(seriesList.length).fill(ButtonTexts.SUBSCRIBE);
      subscribedList.forEach((series) => {
        const index = seriesList.findIndex(item => parseInt(item.tvDbId, 10) === series.tvDbId);

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
  static onPostBack(senderId: string, action: string, series: Series): Promise<any> {
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

      case Actions.HELP:
        return BotController.help();

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
  static onQuickReply(senderId: string, action: string): Promise<{ text: string }> {
    switch (action) {
      case Actions.I_WILL_SEARCH:
        return BotController.searchMessage();
      case Actions.SHOW_TRENDING:
        return BotController.showTrending(senderId);

      default:
        return Promise.reject('unknown action');
    }
  }

  /**
   * Gets called when the 'Get Started' button is clicked
   * @param senderId Social Id of the user (in Fb case, the senderId)
   * @returns {Promise.<{text: string, quick_replies: Array}>}
   */
  static getStarted(senderId: string): Promise<{ text: string, quick_replies: Array<any> }> {
    return ProfileController.get(senderId)
      .then(profile => ({
        text: `Hey ${profile.first_name}!\n` +
        'Would you like to see some trending series\' you can subscribe to?',
        quick_replies: BotConfig.quickReplies.getStarted,
      }));
  }

  /**
   * Message to show when the user clicks "I'll search"
   */
  static searchMessage(): Promise<{ text: string }> {
    return Promise.resolve({
      text: 'Cool! Just type the name of the series & I\'ll search it for you',
    });
  }

  /**
   * Subscribes to a given series
   * @param senderId Social Id of the user (in Fb case, the senderId)
   * @param series The series to subscribe
   */
  static subscribe(senderId: string, series: Series): Promise<{ text: string }> {
    return Models.User.addSubscription(senderId, series)
      .then(() => ({ text: `Subscribed to ${series.name}` }));
  }

  /**
   * Un-Subscribes from a series
   * @param senderId Social Id of the user (in Fb case, the senderId)
   * @param series The series to un-subscribe from
   */
  static unSubscribe(senderId: string, series: Series): Promise<{ text: string }> {
    return Models.User.removeSubscription(senderId, series)
      .then(() => ({ text: `Un-subscribed from ${series.name}` }));
  }

  /**
   * Returns all the shows subscribed by a user
   * @param senderId Social Id of the user requesting
   * @returns {Promise}
   */
  static myShows(senderId: string): Promise<Carousel | { text: string }> {
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
   */
  static showTrending(senderId: string): Promise<Carousel> {
    return Models.Trending.get()
      .then(seriesList => BotController.showSeriesAccToSubscription(seriesList, senderId));
  }

  static nextEpisodeDate(series: Series): Promise<{ text: string }> {
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
        Logger.error(new Error(`unknown next episode: ${series.imdbId}`));
        return unknownEpMsg;
      });
  }

  static help() {
    return Promise.resolve({
      text: 'Just send me the name for the series you are looking for, or select "Show Trending" from the menu.',
    });
  }

}
