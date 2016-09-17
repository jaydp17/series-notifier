'use strict';

const Actions = require('../constants.json').Actions;

class MsgController {

  /**
   * Returns a carousel config that the bot can reply
   * @param seriesList The list of series that have to be in the carousel
   * @param actionList The actions to take when the buttons is clicked
   * @param buttonTextList The texts that should appear on the buttons
   * @returns {{}}
   */
  static carousel(/* Array<Series> */ seriesList, /* Array<string> */ actionList,
                  /* Array<string> */ buttonTextList) {
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
      const card = MsgController.carouselElement(series, actionList[i], buttonTextList[i]);
      elements.push(card);
    });

    return result;
  }

  /**
   * Returns a carousel element configuration
   * @param series The series that has to be in the element
   * @param action The action to take when the button is clicked
   * @param buttonText The text that should appear on the buttons
   * @returns {{}}
   */
  static carouselElement(/* Series */ series, /* string */ action, /* string */ buttonText) {
    const payload = { action, series };
    return {
      title: series.name,
      subtitle: series.genre.join(', '),
      image_url: series.fanArt,
      buttons: [{
        type: 'postback',
        title: buttonText,
        payload: JSON.stringify(payload),
      }],
    };
  }

}

module.exports = MsgController;
