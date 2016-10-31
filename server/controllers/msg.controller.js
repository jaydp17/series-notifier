// @flow

import type{ Series } from '../models/series';
import type { Button } from './persistentmenu.controller';

const constants = require('../constants.json');

const Actions = constants.Actions;
const ButtonTexts = constants.ButtonTexts;

export type CarouselElement = {
  title: string,
  subtitle: string,
  image_url: string,
  buttons: Array<Button>,
};

export type Carousel = {
  attachment: {
    type: string,
    payload: {
      template_type: string,
      elements: Array<CarouselElement>,
    }
  }
};

export default class MsgController {

  /**
   * Returns a carousel config that the bot can reply
   * @param seriesList The list of series that have to be in the carousel
   * @param actionList The actions to take when the buttons is clicked
   * @param buttonTextList The texts that should appear on the buttons
   * @returns {{}}
   */
  static carousel(seriesList: Array<Series>, actionList: Array<string>, buttonTextList: Array<string>): Carousel {
    const result = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [],
        },
      },
    };

    const elements = result.attachment.payload.elements;
    seriesList.forEach((series, i) => {
      const card = MsgController.carouselElement(
        series,
        [ Actions.NEXT_EP_DATE, actionList[i] ],
        [ ButtonTexts.NEXT_EP_DATE, buttonTextList[i] ]
      );
      elements.push(card);
    });

    return result;
  }

  /**
   * Returns a carousel element configuration
   * @param series The series that has to be in the element
   * @param actions A list of actions to take when the button is clicked
   * @param buttonTexts A list of texts that should appear on the buttons
   * @returns {{}}
   */
  static carouselElement(series: Series, actions: Array<string>, buttonTexts: Array<string>): CarouselElement {
    const options = {
      title: series.name,
      subtitle: series.genre.join(', '),
      image_url: series.fanArt,
      buttons: [],
    };
    for (let i = 0; i < actions.length; i++) {
      const button = {
        type: 'postback',
        title: buttonTexts[i],
        payload: JSON.stringify({ action: actions[i], series }),
      };
      options.buttons.push(button);
    }
    return options;
  }

}
