const constants = require('../constants.json');

const Actions = constants.Actions;
const ButtonTexts = constants.ButtonTexts;

export default class MsgController {

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
  static carouselElement(/* Series */ series, /* Array<string> */ actions,
                         /* Array<string> */ buttonTexts) {
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
