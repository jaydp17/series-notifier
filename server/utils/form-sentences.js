// @flow

export function nextEpisode(seriesName: string): Array<string> {
  return [
    `${seriesName} next episode`,
    `${seriesName} release date`,
    `${seriesName} next release date`,
    `new ${seriesName} episode`,
    `upcoming ${seriesName} episode`,
    `when is the next episode of ${seriesName} coming`,
    `when is the next episode of ${seriesName} releasing`,
    `when is the next episode of ${seriesName} going live`,
    `when is the next episode of ${seriesName} airing`,
    `when is the next episode of ${seriesName} launching`,
    `when will be the next episode of ${seriesName}`,
    `when is the next ${seriesName} coming`,
    `when is the next ${seriesName} releasing`,
    `when is the next ${seriesName} going live`,
    `when is the next ${seriesName} airing`,
    `when is the next ${seriesName} launching`,
    `when is next ${seriesName}`,
  ];
}

export function searchSeries(seriesName: string): Array<string> {
  return [
    `${seriesName}`,
    `show ${seriesName}`,
    `show me ${seriesName}`,
  ];
}
