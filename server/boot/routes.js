// @flow

import config from '../config'; // eslint-disable-line import/extensions
import BotController from '../controllers/bot.controller';
import * as Logger from '../utils/logger';
import MessengerApi from '../controllers/messenger.api';
import CustomError from '../utils/custom-error';

export default function (server: any) {
  const router = server.loopback.Router(); // eslint-disable-line new-cap

  router.get('/privacy', (req, res) => {
    const params = {
      botName: config.botName,
      fqdn: config.fqdn,
      fbUsername: config.fb.username,
      hostUrl: `${config.protocol}://${config.fqdn}:${config.port}`,
    };
    res.render('privacy', params);
  });

  /**
   * Verifies webhook subscription
   */
  router.get('/bot', (req, res) => {
    if (req.query['hub.verify_token'] === config.fb.VERIFY_TOKEN) {
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
      let _promise;
      if (postback) {
        _promise = BotController.processPostBack(postback, sender.id);
      } else if (message) {
        _promise = BotController.processIncoming(message, sender.id);
      } else if (quickReply) {
        _promise = BotController.processQuickReply(quickReply, sender.id);
      } else {
        _promise = Promise.reject(new CustomError('Message & PostBack both are null', { messageObj }));
      }
      _promise
        .then(result => MessengerApi.sendMessage(sender.id, result))
        .catch((err) => {
          Logger.error(err);
          return MessengerApi.sendMessage({ text: 'Sorry something went wrong :/' }, console.log); // eslint-disable-line no-console
        });
    });
    return undefined;
  });

  server.use(router);
}
