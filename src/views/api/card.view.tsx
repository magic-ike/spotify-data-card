import React from 'react';
import DataCardProps from '../../interfaces/data-card-props.interface';
import { Item, isTrack } from '../../interfaces/item.interface';
import StringMap from '../../interfaces/map.interface';
import { getBase64DataFromImagePath } from '../../utils/image.util';
import { randomIntFromInterval } from '../../utils/number.util';

const CELL_WIDTH = 500;
const CELL_HEIGHT = 80;
const CELL_PADDING = 10;
const CONTENT_HEIGHT = CELL_HEIGHT - CELL_PADDING * 2;
const TEXT_CONTENT_WIDTH = CELL_WIDTH - CONTENT_HEIGHT - CELL_PADDING * 3;
const BAR_COUNT = Math.ceil((TEXT_CONTENT_WIDTH - 1) / 4);

export default function DataCard({
  userDisplayName,
  nowPlaying,
  topTracks,
  topArtists,
  imageDataMap,
  hideTitle,
  customTitle,
  errorMessage
}: DataCardProps) {
  if (errorMessage) return <div>{errorMessage}</div>;

  // TODO: use other options

  return (
    <DataCardCell
      userDisplayName={userDisplayName}
      item={topTracks[1]}
      imageDataMap={imageDataMap}
      // rank={1}
    />
  );
}

interface DataCardCellProps {
  userDisplayName: string;
  item: Item;
  imageDataMap: StringMap;
  rank?: number;
}

const DataCardCell = ({
  userDisplayName,
  item,
  imageDataMap,
  rank
}: DataCardCellProps) => {
  return (
    <svg
      width={CELL_WIDTH}
      height={CELL_HEIGHT}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      role="img"
      aria-labelledby="card-title"
    >
      <title id="card-title">{userDisplayName}'s Spotify Data</title>
      <style>{generateDataCardCellCSS(item, rank)}</style>
      <foreignObject width="100%" height="100%">
        <div
          // @ts-ignore
          xmlns="http://www.w3.org/1999/xhtml"
        >
          {/* TODO: create separate component */}
          <div className="container">
            {isTopItem(item, rank) && (
              <div className="rank big-text">{rank}</div>
            )}
            <a href="{}" target="_BLANK" className="cover-link">
              <img
                src={
                  item
                    ? 'data:image/jpeg;base64, ' +
                      imageDataMap[
                        isTrack(item) ? item.albumImageUrl : item.imageUrl
                      ]
                    : 'data:image/png;base64, ' +
                      getBase64DataFromImagePath(
                        'src/public/images/Spotify_Icon_RGB_Green.png'
                      )
                }
                width={CONTENT_HEIGHT}
                height={CONTENT_HEIGHT}
                className="cover"
              />
            </a>
            <div className="text-container">
              {item ? (
                <>
                  <div className={isTrack(item) ? 'artist' : 'big-text'}>
                    {isTrack(item) ? item.artist : item.name}
                  </div>
                  {isTrack(item) && (
                    <>
                      <div className="song">
                        {item.title} • {item.albumTitle}
                      </div>
                      {/* scrolling animation */}
                      {/* <div className="song-container">
                        <div className="song scrolling">
                          {item.title} • {item.albumTitle}
                        </div>
                        <div className="song scrolling" aria-hidden="true">
                          {item.title} • {item.albumTitle}
                        </div>
                        <div className="song scrolling" aria-hidden="true">
                          {item.title} • {item.albumTitle}
                        </div>
                      </div> */}
                      {isNowPlaying(item, rank) && (
                        <div className="bars">
                          {generateBarContent(BAR_COUNT)}
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <div className="big-text">Nothing</div>
              )}
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
};

// helper functions

const isNowPlaying = (item: Item, rank?: number) => {
  return isTrack(item) && typeof rank === 'undefined';
};

const isTopItem = (item: Item, rank?: number) => {
  return item && typeof rank === 'number';
};

const generateDataCardCellCSS = (item: Item, rank?: number) => {
  return `
    div {
      font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji;
    }

    .container {
      background-color: #121212;
      color: white;

      height: ${CONTENT_HEIGHT}px;

      display: flex;
      align-items: center;

      border-radius: 10px;

      padding: 10px 10px
    }

    .rank {

    }

    .big-text {
      font-weight: 500;
      font-size: 20px;
    }

    .cover-link {
      height: 100%;
      margin-right: ${CELL_PADDING}px;
    }

    .text-container {
      width: ${TEXT_CONTENT_WIDTH}px;
    }

    .artist {
      font-weight: 500;
      font-size: 14px;

      margin-bottom: 3px;
    }

    .song {
      color: #b3b3b3;

      font-size: 14px;

      ${isNowPlaying(item, rank) ? `margin-bottom: 18px;` : ''}
    }
    
    /* scrolling animation */

    /*
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
    */

    /* /scrolling animation */

    .bars {
      position: absolute;
      height: 6px;
      width: ${TEXT_CONTENT_WIDTH}px;
      overflow: hidden;
      margin: -6px 0 0 0;
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

    ${generateBarCSS(BAR_COUNT)}
  `;
};

const generateBarContent = (barNum = 75) => {
  let barContent: JSX.Element[] = [];
  for (let i = 0; i < barNum; i++) barContent.push(<div className="bar"></div>);
  return barContent;
};

const generateBarCSS = (barNum = 75) => {
  let barCSS = '';
  let left = 0;
  for (let i = 1; i <= barNum; i++) {
    const anim = randomIntFromInterval(350, 500);
    barCSS += `.bar:nth-child(${i}) { left: ${left}px; animation-duration: ${anim}ms; }`;
    left += 4;
  }
  return barCSS;
};
