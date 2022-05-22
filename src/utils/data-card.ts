import Track, { isTrack } from '../interfaces/track.interface';
import Artist from '../interfaces/artist.interface';
import { randomIntFromInterval } from './number';

type ItemHandlerArgs = [item: Track | Artist /*| null*/, rank?: number];

export const generateCard = (
  nowPlaying: Track | null,
  topTracks: Track[],
  topArtists: Artist[],
  hideTitle: boolean,
  customTitle?: string
) => {};

export const generateCardCell = (
  userDisplayName: string,
  ...[item, rank]: ItemHandlerArgs
) => {
  return `
<svg width="320" height="84" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-labelledby="card-title" role="img">
  <title id="card-title">${userDisplayName}'s Spotify Data</title>
  <foreignObject width="320" height="84">
    <style>
      div {
        font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji;
      }

      .container {
        display: flex;
        align-items: center;

        border-radius: 10px;

        padding: 10px 10px
      }

      .cover-link {
        height: 64px;
      }

      .cover {
        margin-right: 10px;
      }

      .playing {
        display: flex;
        justify-content: center;
        align-items: center;

        color: #53b14f;
        font-weight: bold;
        text-align: center;

        margin-bottom: 8px;
      }

      .not-play {
        color: #ff1616;
        text-align: center;

        margin-bottom: 0;
      }

      .text-container {
        width: 220px;
      }

      .artist {
        color: #121212;
        font-weight: 500;
        font-size: 14px;

        margin-bottom: 3px;
      }

      .song {
        color: #212122;
        font-size: 14px;

        ${isNowPlaying(item, rank) ? `margin-bottom: 18px;` : ''}
      }

      @media (prefers-color-scheme: light) {
        .artist{
          color: #121212;
        }

        .song{
          color: #212122;
        }
      }

      @media (prefers-color-scheme: dark) {
        .artist{
          color: #f4f4f4;
        }

        .song{
          color: #dbdbdc;
        }
      }
      
      /* scrolling animation */

      .song-container {
        overflow: hidden;
        white-space: nowrap;
      }

      .scrolling {
        animation: marquee 8s linear infinite;
        display: inline-block;
        padding-right: 20px;
      }

      @keyframes marquee {
        from {
          transform: translateX(0);
        }
        to {
          transform: translateX(-100%);
        }
      }

      /* /scrolling animation */

      #bars {
        position: absolute;
        height: 6px;
        width: 220px;
        overflow: hidden;
        margin: -6px 0 0 0px;
      }

      .bar {
        background: #53b14f;
        bottom: 1px;
        height: 3px;
        position: absolute;
        width: 3px;
        animation: sound 0ms -800ms linear infinite alternate;
      }

      @keyframes sound {
        0% {
          opacity: .35;
          height: 3px;
        }

        100% {
          opacity: 1;
          height: 6px;
        }
      }

      ${generateBarCSS()}
    </style>
    <div xmlns="http://www.w3.org/1999/xhtml" class="container">
      <a href="{}" target="_BLANK" class="cover-link">
        <img src="${
          isTrack(item) ? item.albumImageUrl : item.imageUrl
        }" width="64" height="64" class="cover" />
      </a>
      <div class="text-container">
        <div class="artist">${isTrack(item) ? item.artist : item.name}</div>
        ${
          isTrack(item)
            ? `
              <div class="song-container">
                <div class="song scrolling">${item.title} • ${
                item.albumTitle
              }</div>
                <div class="song scrolling" aria-hidden="true">${
                  item.title
                } • ${item.albumTitle}</div>
                <div class="song scrolling" aria-hidden="true">${
                  item.title
                } • ${item.albumTitle}</div>
              </div>
              ${
                isNowPlaying(item, rank)
                  ? `<div id='bars'>${generateBarContent()}</div>`
                  : ''
              }
            `
            : ''
        }
      </div>
    </div>
  </foreignObject>
</svg>
`;
};

// helper functions

const isNowPlaying = (...[item, rank]: ItemHandlerArgs) => {
  return isTrack(item) && typeof rank === 'undefined';
};

const isTopItem = (...[_item, rank]: ItemHandlerArgs) => {
  return typeof rank === 'number';
};

const generateBarContent = (barNum = 75) => {
  let barContent = '';
  for (let i = 0; i < barNum; i++) {
    barContent += "<div class='bar'></div>";
  }
  return barContent;
};

const generateBarCSS = (barNum = 75) => {
  let barCSS = '';
  let left = 1;
  for (let i = 0; i < barNum; i++) {
    const anim = randomIntFromInterval(350, 500);
    barCSS += `.bar:nth-child(${
      i + 1
    }) { left: ${left}px; animation-duration: ${anim}ms; }`;
    left += 4;
  }
  return barCSS;
};
