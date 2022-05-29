import React from 'react';
import pixelWidth from 'string-pixel-width';
import DataCardProps from '../../interfaces/data-card-props.interface';
import { Item, isTrack } from '../../interfaces/item.interface';
import StringMap from '../../interfaces/map.interface';
import { getBase64DataFromImagePath } from '../../utils/image.util';
import { randomIntFromInterval } from '../../utils/number.util';

const CELL_WIDTH = 500;
const CELL_HEIGHT = 80;
const CELL_SPACING = 10;
const RANK_WIDTH = 15;
const CONTENT_HEIGHT = CELL_HEIGHT - CELL_SPACING * 2;
const BARS_WIDTH = CELL_WIDTH - CONTENT_HEIGHT - CELL_SPACING * 3;
const BAR_COUNT = Math.ceil((BARS_WIDTH - 1) / 4);

const TEXT_SIZE = 14;
const BIG_TEXT_SIZE = 20;

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
      item={topTracks[0]}
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
  const Container = item ? 'a' : 'div';
  const cellTitle = item ? (isTrack(item) ? item.title : item.name) : 'Nothing';
  const cellSubtitle = isTrack(item)
    ? `${item.artist} • ${item.albumTitle}`
    : '';

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
          {/* TODO: move this to separate component */}
          <Container
            className="container"
            href={item?.url}
            target={item ? '_blank' : undefined}
            rel={item ? 'noreferrer' : undefined}
          >
            {isTopItem(item, rank) && (
              <div className="rank big-text">{rank}</div>
            )}
            <img
              src={
                item
                  ? 'data:image/jpeg;base64,' +
                    imageDataMap[
                      isTrack(item) ? item.albumImageUrl : item.imageUrl
                    ]
                  : 'data:image/png;base64,' +
                    getBase64DataFromImagePath(
                      'src/public/images/Spotify_Icon_RGB_Green.png'
                    )
              }
              width={CONTENT_HEIGHT}
              height={CONTENT_HEIGHT}
            />
            <div className="text-container">
              {item ? (
                <>
                  <div
                    className={
                      (isTrack(item) ? 'track-title' : 'big-text') +
                      ' scrolling-container'
                    }
                  >
                    {textOverflows(
                      cellTitle,
                      isTrack(item) ? TEXT_SIZE : BIG_TEXT_SIZE,
                      item,
                      rank
                    ) ? (
                      <>
                        <div className="scrolling">{cellTitle}</div>
                        <div className="scrolling" aria-hidden="true">
                          {cellTitle}
                        </div>
                      </>
                    ) : (
                      cellTitle
                    )}
                  </div>
                  {isTrack(item) && (
                    <>
                      <div className="track-subtitle scrolling-container">
                        {textOverflows(cellSubtitle, TEXT_SIZE, item, rank) ? (
                          <>
                            <div className="scrolling">{cellSubtitle}</div>
                            <div className="scrolling" aria-hidden="true">
                              {cellSubtitle}
                            </div>
                          </>
                        ) : (
                          cellSubtitle
                        )}
                      </div>
                      {isNowPlaying(item, rank) && (
                        <div className="bars">
                          {generateBarContent(BAR_COUNT)}
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <div className="big-text">{cellTitle}</div>
              )}
            </div>
          </Container>
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

const textOverflows = (
  text: string,
  size: number,
  item: Item,
  rank?: number
) => {
  const width = pixelWidth(text, {
    font: 'arial',
    size: size,
    bold: true // adds extra width to slightly overestimate
  });
  const maxWidth = getTextContainerWidth(item, rank);
  return width > maxWidth;
};

const getTextContainerWidth = (item: Item, rank?: number) => {
  let width = BARS_WIDTH;
  if (isTopItem(item, rank)) width -= RANK_WIDTH + CELL_SPACING;
  return width;
};

const generateBarContent = (barNum: number) => {
  let barContent: JSX.Element[] = [];
  for (let i = 0; i < barNum; i++)
    barContent.push(<div className="bar" key={i}></div>);
  return barContent;
};

const generateBarCSS = (barNum: number) => {
  let barCSS = '';
  let left = 0;
  for (let i = 1; i <= barNum; i++) {
    const anim = randomIntFromInterval(350, 500);
    barCSS += `.bar:nth-child(${i}) { left: ${left}px; animation-duration: ${anim}ms; }`;
    left += 4;
  }
  return barCSS;
};

const generateDataCardCellCSS = (item: Item, rank?: number) => {
  return `
    div {
      font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji;
    }

    a {
      text-decoration: none;
    }

    img {
      object-fit: cover;
    }

    .container {
      background-color: #121212;
      color: white;

      height: ${CONTENT_HEIGHT}px;

      display: flex;
      align-items: center;
      gap: ${CELL_SPACING}px;

      border-radius: 10px;

      padding: ${CELL_SPACING}px;
    }

    .container:hover {
      background-color: #2a2a2a;
    }

    .rank {
      text-align: center;
      width: ${RANK_WIDTH}px;
    }

    .big-text {
      font-weight: 500;
      font-size: ${BIG_TEXT_SIZE}px;
    }

    .text-container {
      width: ${getTextContainerWidth(item, rank)}px;
    }

    .track-title,
    .track-subtitle {
      font-size: ${TEXT_SIZE}px;
    }

    .track-title {
      font-weight: 500;

      margin-bottom: 3px;
    }

    .track-subtitle {
      color: #b3b3b3;

      ${isNowPlaying(item, rank) ? 'margin-bottom: 18px;' : ''}
    }
    
    /* scrolling animation */

    .scrolling-container {
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

    /* bars animation */

    .bars {
      position: absolute;
      height: 6px;
      width: ${BARS_WIDTH}px;
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

    /* /bars animation */
  `;
};
