// @flow

const config = require('../config');

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

  server.use(router);
}
