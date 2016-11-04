// @flow

const config = require('../config');

export default function (server: any) {
  const router = server.loopback.Router(); // eslint-disable-line new-cap

  router.get('/privacy', (req, res) => {
    const params = {
      botName: config.botName,
      fqdn: config.fqdn,
      hostUrl: `${config.protocol}://${config.fqdn}:${config.port}`,
      messengerUrl: `m.me/${config.fb.messengerId}`,
      messengerUrlWithProtocol: `http://m.me/${config.fb.messengerId}`,
      fbPageUrl: `fb.com/${config.fb.pageHandle}`,
      fbPageUrlWithProtocol: `http://fb.com/${config.fb.pageHandle}`,
    };
    res.render('privacy', params);
  });

  server.use(router);
}
