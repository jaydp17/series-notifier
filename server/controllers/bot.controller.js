// @flow

import Promise from 'bluebird';
import moment from 'moment';
import Rx from 'rxjs/Rx';

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
   * @returns {Rx.Observable}
   */
  static processIncoming(message: FbMessage, senderId: string): Rx.Observable<any> {
    const text = (message.text || '').trim();
    if (message.is_echo || !text) return Rx.Observable.empty();

    if (message.quick_reply) {
      const quickReply = JSON.parse(message.quick_reply.payload);
      return Rx.Observable.fromPromise(BotController.onQuickReply(senderId, quickReply.action));
    }
    return BotController.onMessage(senderId, text);
  }

  /**
   * Parses the facebook postback object and dispatches the control flow
   * @param postback Postback object sent by facebook
   * @param senderId Id of the sender
   * @returns {Rx.Observable}
   */
  static processPostBack(postback: FbPostBack, senderId: string): Rx.Observable<any> {
    const payload = JSON.parse(postback.payload);
    if (!payload.action) {
      const error = new CustomError('Action not found in PostBack payload', { payload });
      return Rx.Observable.throw(error);
    }
    return BotController.onPostBack(senderId, payload.action, payload.series);
  }

  /**
   * Parses the facebook QuickReply object and dispatches the control flow
   * @param quickReply QuickReply object sent by facebook
   * @param senderId Id of the sender
   * @returns {Rx.Observable}
   */
  static processQuickReply(quickReply: FbQuickReply, senderId: string): Rx.Observable<any> {
    const payload = JSON.parse(quickReply.payload);
    if (!payload.action) {
      const error = new CustomError('Action not found in QuickReply payload', { payload });
      return Rx.Observable.throw(error);
    }
    return Rx.Observable.fromPromise(BotController.onQuickReply(senderId, payload.action));
  }

  /**
   * Called when a user msgs something to the bot
   * @param senderId The social id of the sender
   * @param text The message that the user sent
   * @returns {Rx.Observable}
   */
  static onMessage(senderId: string, text: string): Rx.Observable<any> {
    const noSeriesMsg = 'no_series_found';
    return Rx.Observable.fromPromise(TraktController.search(text))
      .map(seriesList => seriesList.filter(series => series.running))
      .switchMap((seriesList: Array<Series>) => {
        if (seriesList.length === 0) {
          return Rx.Observable.throw(new Error(noSeriesMsg));
        }
        return Rx.Observable.of(seriesList);
      })
      .switchMap(seriesList => BotController.showSeriesAccToSubscription(seriesList, senderId))
      .catch((err: Error) => {
        if (err.message === noSeriesMsg) {
          return Rx.Observable.of({ text: 'Sorry, no Series found with that name :/' });
        }
        return Rx.Observable.throw(err);
      });
  }

  /**
   * Takes a list of Series and shows them in a carousel,
   * with respect to the subscriptions that a user has.
   * For Eg. if the list contains BBT & Suits, and let's say the user is already
   * subscribed to  BBT, then it will show UN-SUBSCRIBE under BBT & SUBSCRIBE under Suits
   * @param seriesList The list of series to show
   * @param senderId The social id of the sender
   * @returns {Rx.Observable}
   */
  static showSeriesAccToSubscription(seriesList: Array<Series>, senderId: string): Rx.Observable<Carousel> {
    const _promise = Promise.props({
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
    return Rx.Observable.fromPromise(_promise);
  }

  /**
   * Called when the user clicks a button
   * @param senderId Social Id of the user (in Fb case, the senderId)
   * @param action Action associated with the button
   * @param series The series on which the action was performed
   * @returns {Rx.Observable}
   */
  static onPostBack(senderId: string, action: string, series: Series): Rx.Observable<any> {
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
        return Rx.Observable.throw(new CustomError('unknown action', { action }));
    }
  }

  /**
   * Called when the user clicks a quick reply
   * @param senderId Social Id of the user (in Fb cas, the senderId)
   * @param action Action associated with the button
   * @returns {Rx.Observable}
   */
  static onQuickReply(senderId: string, action: string): Rx.Observable<{ text: string }> {
    switch (action) {
      case Actions.I_WILL_SEARCH:
        return BotController.searchMessage();
      case Actions.SHOW_TRENDING:
        return BotController.showTrending(senderId);

      default:
        return Promise.reject(new CustomError('unknown action', { action }));
    }
  }

  /**
   * Gets called when the 'Get Started' button is clicked
   * @param senderId Social Id of the user (in Fb case, the senderId)
   * @returns {Rx.Observable.<{text: string, quick_replies: Array}>}
   */
  static getStarted(senderId: string): Rx.Observable<{ text: string, quick_replies: Array<any> }> {
    return Rx.Observable.fromPromise(ProfileController.get(senderId))
      .map(profile => ({
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
  static subscribe(senderId: string, series: Series): Rx.Observable<{ text: string }> {
    return Rx.Observable.fromPromise(
      Models.User.addSubscription(senderId, series)
    ).map(() => ({ text: `Subscribed to ${series.name}` }));
  }

  /**
   * Un-Subscribes from a series
   * @param senderId Social Id of the user (in Fb case, the senderId)
   * @param series The series to un-subscribe from
   */
  static unSubscribe(senderId: string, series: Series): Rx.Observable<{ text: string }> {
    return Rx.Observable.fromPromise(
      Models.User.removeSubscription(senderId, series)
    ).map(() => ({ text: `Un-subscribed from ${series.name}` }));
  }

  /**
   * Returns all the shows subscribed by a user
   * @param senderId Social Id of the user requesting
   * @returns {Promise}
   */
  static myShows(senderId: string): Rx.Observable<any> {
    const _promise = Models.User.myShows(senderId)
      .then((seriesList) => {
        if (seriesList.length === 0) {
          return { text: 'Sorry, you haven\'t subscribed to any shows yet' };
        }
        const actionList = new Array(seriesList.length).fill(Actions.UN_SUBSCRIBE);
        const buttonTextList = new Array(seriesList.length).fill(ButtonTexts.UN_SUBSCRIBE);
        return MsgController.carousel(seriesList, actionList, buttonTextList);
      });
    return Rx.Observable.fromPromise(_promise);
  }

  /**
   * Returns all the Trending shows
   * @param senderId Social Id of the user requesting
   */
  static showTrending(senderId: string): Rx.Observable<Carousel> {
    return Rx.Observable.fromPromise(Models.Trending.get())
      .switchMap(seriesList => BotController.showSeriesAccToSubscription(seriesList, senderId));
  }

  static nextEpisodeDate(series: Series): Rx.Observable<{ text: string }> {
    // eslint-disable-next-line max-len
    const unknownEpMsg = { text: `Sorry, I don't know the exact release date of ${series.name}'s next episode.` };
    const nextEpPromise = TraktController.getNextEpisode(series.imdbId);
    return Rx.Observable.fromPromise(nextEpPromise)
      .map((nextEp) => {
        if (!nextEp) return unknownEpMsg;
        const epNumber = (`00${nextEp.number}`).slice(-2);
        const seriesNumber = (`00${nextEp.season}`).slice(-2);
        const timeDiff = moment(nextEp.first_aired).fromNow();
        return ({
          text: `S${seriesNumber}E${epNumber} of ${series.name} goes live ${timeDiff}`,
        });
      })
      .catch(() => {
        Logger.error(new Error(`unknown next episode: ${series.imdbId}`));
        return Rx.Observable.of(unknownEpMsg);
      });
  }

  static help(): Rx.Observable<{ text: string }> {
    return Rx.Observable.create((observer) => {
      observer.next({ text: 'Just send me the name for the series you are looking for' });
      return Promise.delay(1000)
        .then(() => observer.next({ text: 'or' }))
        .delay(500)
        .then(() => observer.next({ text: 'select "Show Trending" from the menu' }))
        .finally(() => observer.complete());
    });
  }

}
