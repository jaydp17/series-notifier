import loopback from 'loopback';
import boot from 'loopback-boot';
import loopbackConsole from 'loopback-console';

const app = module.exports = loopback();

app.start = function () {
  // start the web server
  return app.listen(() => {
    app.emit('started');
    const baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl); // eslint-disable-line no-console
    if (app.get('loopback-component-explorer')) {
      const explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath); // eslint-disable-line no-console
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, (err) => {
  if (err) throw err;

  if (loopbackConsole.activated()) {
    loopbackConsole.start(app, { prompt: 'app # ' });
  } else if (require.main === module) {
    app.start();
  }
});
