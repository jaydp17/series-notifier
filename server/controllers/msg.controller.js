'use strict';

const Actions = require('../constants.json').Actions;

class MsgController {

  /**
   * Returns a carousel config that the bot can reply
   * @param seriesList The list of series that have to be in the carousel
   * @returns {{}}
   */
  static carousel(/* Array<Series> */ seriesList) {
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
    for (let series of seriesList) {
      elements.push(MsgController.carouselElement(series));
    }

    return result;
  }

  /**
   * Returns a carousel element configuration
   * @param series The series that has to be in the element
   * @returns {{}}
   */
  static carouselElement(/* Series */ series) {
    const payload = {
      action: Actions.SUBSCRIBE,
      series,
    };
    return {
      title: series.name,
      subtitle: series.genre.join(', '),
      image_url: series.fanArt,
      buttons: [{
        type: 'postback',
        title: 'Notify Me',
        payload: JSON.stringify(payload),
      }],
    };
  }

}

module.exports = MsgController;
