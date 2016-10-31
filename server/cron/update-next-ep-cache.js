import { models as Models } from '../server';

// stores all the unique imdbIds people have already subscribed to
const ImdbIds = new Set();

// the below query find the imdbIds of the series that people have subscribed to
// coz not all series in the Series collection are subscribed
Models.User.find({
  include: {
    relation: 'subscriptions',
    scope: {
      fields: [ 'imdbId' ],
    },
  },
}).map(d => d.subscriptions())
  .map((d) => {
    d.forEach(ep => ImdbIds.add(ep.imdbId));
    return undefined;
  })
  .then(() => [ ...ImdbIds ])
  .map(imdbId => Models.NextEpisodeCache.updateSeries(imdbId))
  .then(console.log) // eslint-disable-line no-console
  .then(() => console.log('done')) // eslint-disable-line no-console
  .then(() => process.exit(0));

