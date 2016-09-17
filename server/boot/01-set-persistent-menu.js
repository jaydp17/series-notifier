'use strict';

const PersistentMenu = require('../controllers/persistentmenu.controller');

const menuButtons = require('../persistent-menu');

module.exports = () => {
  const buttons = Object.keys(menuButtons)
    .map(key => menuButtons[key]);

  return PersistentMenu.set(buttons)
    .then(console.log).catch(console.error);
};
