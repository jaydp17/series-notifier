// @flow

import Rx from 'rxjs/Rx';

import BotController from '../controllers/bot.controller';
import * as Logger from '../utils/logger';
import MessengerApi from '../controllers/messenger.api';
import CustomError from '../utils/custom-error';
import app from '../server';

const FbConstants = app.get('fb');

export default function (server: any) {
  const router = server.loopback.Router(); // eslint-disable-line new-cap

  router.get('/privacy', (req, res) => {
    const params = {
      botName: app.get('botName'),
      fqdn: app.get('fqdn'),
      fbUsername: FbConstants.username,
      hostUrl: `${app.get('protocol')}://${app.get('fqdn')}:${app.get('port')}`,
    };
    res.render('privacy', params);
  });

  /**
   * Verifies webhook subscription
   */
  router.get('/bot', (req, res) => {
    if (req.query['hub.verify_token'] === FbConstants.VERIFY_TOKEN) {
      res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong token');
  });

  /**
   * Actually used by Fb messenger to send messages
   */
  router.post('/bot', (req, res) => {
    const { object: objectType } = req.body;
    if (objectType !== 'page') {
      return res.status(403).send('Invalid Object Type');
    }
    res.sendStatus(200);

    const { entry } = req.body;
    const messagingArr = entry[0].messaging;
    messagingArr.forEach((messagingObj) => {
      const { message, postback, sender, quick_reply: quickReply } = messagingObj;
      let _observable: Rx.Observable<any>;
      if (postback) {
        _observable = BotController.processPostBack(postback, sender.id);
      } else if (message) {
        _observable = BotController.processIncoming(message, sender.id);
      } else if (quickReply) {
        _observable = BotController.processQuickReply(quickReply, sender.id);
      } else {
        _observable = Rx.Observable.throw(new CustomError('Message & PostBack both are null', { messagingObj }));
      }
      _observable
        .take(3)
        .switchMap(msgObj => MessengerApi.sendMessage(sender.id, msgObj))
        .catch((err) => {
          // whenever there's an error log it and let the user know
          Logger.error(err);
          return MessengerApi.sendMessage(sender.id, { text: 'Sorry something went wrong :/' });
        })
        .subscribe(
          result => Logger.info('result', result),
          err => Logger.error(err),
        );
    });
    return undefined;
  });

  server.use(router);
}
