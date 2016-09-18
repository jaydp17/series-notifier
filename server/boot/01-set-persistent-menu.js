'use strict';

const PersistentMenu = require('../controllers/persistentmenu.controller');

const { persistentMenu } = require('../bot-config');

module.exports = () => {
  const buttons = Object.keys(persistentMenu)
    .map(key => persistentMenu[key]);

  return PersistentMenu.set(buttons)
    .then(console.log).catch(console.error);
};
