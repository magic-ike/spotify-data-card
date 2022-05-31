import React from 'react';
import pixelWidth from 'string-pixel-width';
import DataCardProps from '../../interfaces/data-card-props.interface';
import { Item, isTrack } from '../../interfaces/item.interface';
import StringMap from '../../interfaces/map.interface';
import { randomIntFromInterval } from '../../utils/number.util';

// card dimensions
const CARD_SPACING = 10;
const CARD_TITLE_HEIGHT = 50;
const CARD_SUBTITLE_HEIGHT = 45;

// cell dimensions
const CELL_WIDTH = 300;
const CELL_HEIGHT = 70;
const RANK_WIDTH = 15;
const CONTENT_HEIGHT = CELL_HEIGHT - CARD_SPACING * 2;
const BARS_WIDTH = CELL_WIDTH - CONTENT_HEIGHT - CARD_SPACING * 3;
const BAR_COUNT = Math.ceil(BARS_WIDTH / 4);
const ERROR_MESSAGE_WIDTH = CELL_WIDTH * 2;

// font sizes
const CARD_TITLE_FONT_SIZE = 25;
const CARD_SUBTITLE_FONT_SIZE = 20;
const BIG_TEXT_FONT_SIZE = 16;
const TEXT_FONT_SIZE = 14;

export default function DataCard({
  userDisplayName,
  customTitle,
  showTitle,
  nowPlaying,
  recentlyPlayed,
  topTracks,
  topArtists,
  imageDataMap,
  showNowPlaying,
  showRecentlyPlayed,
  showTopTracks,
  showTopArtists,
  hideExplicit,
  showBorder,
  itemLimit,
  errorMessage
}: DataCardProps) {
  // calculate card size
  let cardWidth = CARD_SPACING * 2;
  let cardHeight = CARD_SPACING * 2;
  if (errorMessage) {
    cardWidth += ERROR_MESSAGE_WIDTH;
    cardHeight += CARD_TITLE_HEIGHT;
  } else {
    // card width
    let minCardWidth = cardWidth + CELL_WIDTH;
    for (const setting of [showRecentlyPlayed, showTopTracks, showTopArtists]) {
      if (!setting) continue;
      cardWidth += CELL_WIDTH;
    }
    cardWidth = Math.max(cardWidth, minCardWidth);

    // card height
    if (showTitle) cardHeight += CARD_TITLE_HEIGHT;
    if (showNowPlaying) cardHeight += CARD_SUBTITLE_HEIGHT + CELL_HEIGHT;
    if (showRecentlyPlayed || showTopTracks || showTopArtists)
      cardHeight += CARD_SUBTITLE_HEIGHT + CELL_HEIGHT * itemLimit;
  }

  return (
    <svg
      width={cardWidth}
      height={cardHeight}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby="title"
    >
      <style>{generateDataCardCellCSS()}</style>
      <foreignObject width="100%" height="100%">
        <div
          // @ts-ignore
          xmlns="http://www.w3.org/1999/xhtml"
        >
          <div
            className="card-container"
            style={{ border: showBorder ? '3px solid white' : undefined }}
          >
            {errorMessage ? (
              <div className="card-title error-message scrolling-container">
                {textOverflows(
                  errorMessage,
                  CARD_TITLE_FONT_SIZE,
                  ERROR_MESSAGE_WIDTH
                ) ? (
                  <>
                    <div id="title" className="scrolling">
                      {errorMessage}
                    </div>
                    <div className="scrolling" aria-hidden="true">
                      {errorMessage}
                    </div>
                  </>
                ) : (
                  <div id="title">{errorMessage}</div>
                )}
              </div>
            ) : (
              <>
                <div
                  id="title"
                  className="card-title"
                  style={{ display: showTitle ? undefined : 'none' }}
                >
                  {customTitle ||
                    `${userDisplayName}'s Spotify Data${
                      hideExplicit ? ' (Clean)' : ''
                    }`}
                </div>

                {showNowPlaying && (
                  <section className="now-playing-section">
                    <div className="card-subtitle">Currently Listening To</div>
                    <DataCardCell
                      item={nowPlaying}
                      imageDataMap={imageDataMap}
                    />
                  </section>
                )}

                <div className="other-sections">
                  {showRecentlyPlayed && (
                    <section>
                      <div className="card-subtitle">
                        Recently Played Tracks
                      </div>
                      {recentlyPlayed.map((track, i) => (
                        <DataCardCell
                          item={track}
                          imageDataMap={imageDataMap}
                          rank={i + 1}
                        />
                      ))}
                    </section>
                  )}

                  {showTopTracks && (
                    <section>
                      <div className="card-subtitle">Top Tracks</div>
                      {topTracks.map((track, i) => (
                        <DataCardCell
                          item={track}
                          imageDataMap={imageDataMap}
                          rank={i + 1}
                        />
                      ))}
                    </section>
                  )}

                  {showTopArtists && (
                    <section>
                      <div className="card-subtitle">Top Artists</div>
                      {topArtists.map((artist, i) => (
                        <DataCardCell
                          item={artist}
                          imageDataMap={imageDataMap}
                          rank={i + 1}
                        />
                      ))}
                    </section>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}

interface DataCardCellProps {
  item: Item;
  imageDataMap: StringMap;
  rank?: number;
}

const DataCardCell = ({ item, imageDataMap, rank }: DataCardCellProps) => {
  const CellContainer = item ? 'a' : 'div';
  const cellTitle = item ? (isTrack(item) ? item.title : item.name) : 'Nothing';
  const cellSubtitle = isTrack(item)
    ? `${item.artist} • ${item.albumTitle}`
    : '';

  return (
    <CellContainer
      className="cell-container"
      href={item?.url}
      target={item ? '_blank' : undefined}
      rel={item ? 'noreferrer' : undefined}
    >
      {item ? (
        <>
          {isTopItem(item, rank) && <div className="rank big-text">{rank}</div>}
          <img
            src={
              'data:image/jpeg;base64,' +
              imageDataMap[isTrack(item) ? item.albumImageUrl : item.imageUrl]
            }
            width={CONTENT_HEIGHT}
            height={CONTENT_HEIGHT}
            className="cover"
          />
          <div
            className="text-container"
            style={{ width: getTextContainerWidth(item, rank) }}
          >
            <div
              className={
                (isTrack(item) ? 'track-title' : 'big-text') +
                ' scrolling-container'
              }
            >
              {textOverflows(
                cellTitle,
                isTrack(item) ? TEXT_FONT_SIZE : BIG_TEXT_FONT_SIZE,
                getTextContainerWidth(item, rank)
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
                <div
                  className="track-subtitle scrolling-container"
                  style={{
                    marginBottom: isNowPlaying(item, rank) ? 14 : undefined
                  }}
                >
                  {textOverflows(
                    cellSubtitle,
                    TEXT_FONT_SIZE,
                    getTextContainerWidth(item, rank)
                  ) ? (
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
                  <div className="bars">{generateBarContent()}</div>
                )}
              </>
            )}
          </div>
        </>
      ) : (
        <div className="not-playing big-text">{cellTitle}</div>
      )}
    </CellContainer>
  );
};

// helper functions

const isNowPlaying = (item: Item, rank?: number) => {
  return isTrack(item) && typeof rank === 'undefined';
};

const isTopItem = (item: Item, rank?: number) => {
  return item && typeof rank === 'number';
};

const textOverflows = (text: string, size: number, maxWidth: number) => {
  const width = pixelWidth(text, {
    font: 'arial',
    size: size,
    bold: true // adds extra width to slightly overestimate
  });
  return width > maxWidth;
};

const getTextContainerWidth = (item: Item, rank?: number) => {
  let width = BARS_WIDTH;
  if (isTopItem(item, rank)) width -= RANK_WIDTH + CARD_SPACING;
  return width;
};

const generateBarContent = () => {
  let barContent: JSX.Element[] = [];
  for (let i = 0; i < BAR_COUNT; i++)
    barContent.push(<div className="bar" key={i}></div>);
  return barContent;
};

const generateBarCSS = () => {
  let barCSS = '';
  let left = 0;
  for (let i = 1; i <= BAR_COUNT; i++) {
    const anim = randomIntFromInterval(350, 500);
    barCSS += `.bar:nth-child(${i}) { left: ${left}px; animation-duration: ${anim}ms; }`;
    left += 4;
  }
  return barCSS;
};

const generateDataCardCellCSS = () => {
  return `
    * {
      box-sizing: border-box;
    }

    :root {
      --black: #121212;
      --gray: #2a2a2a;
      --light-gray: #b3b3b3;
      --green: #1db954;
    }

    div {
      font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji;
      font-weight: 500;
    }

    a {
      text-decoration: none;
    }

    img {
      object-fit: cover;
    }

    .card-container {
      background-color: var(--black);
      color: white;
      border-radius: 15px;
      overflow: hidden;
    }

    .error-message {
      color: red !important;
    }

    .card-title {
      color: var(--green);
      font-size: ${CARD_TITLE_FONT_SIZE}px;
      height: ${CARD_TITLE_HEIGHT}px;
    }

    .card-subtitle {
      font-size: ${CARD_SUBTITLE_FONT_SIZE}px;
      height: ${CARD_SUBTITLE_HEIGHT}px;
    }

    .card-title,
    .card-subtitle {
      text-align: center;
    }

    .now-playing-section {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .other-sections {
      display: flex;
      justify-content: center;
    }

    .cell-container {
      color: inherit;

      width: ${CELL_WIDTH}px;
      height: ${CELL_HEIGHT}px;

      display: flex;
      align-items: center;
      gap: ${CARD_SPACING}px;
    }

    .cell-container:hover {
      background-color: var(--gray);
    }

    .card-container,
    .card-title,
    .card-subtitle,
    .cell-container {
      padding: ${CARD_SPACING}px;
    }

    .rank {
      text-align: center;
      width: ${RANK_WIDTH}px;
    }

    .big-text {
      font-size: ${BIG_TEXT_FONT_SIZE}px;
    }

    .cover {}

    .text-container {}

    .track-title {
      margin-bottom: 3px;
    }

    .track-subtitle {
      color: var(--light-gray);
      font-weight: 400;
    }

    .track-title,
    .track-subtitle {
      font-size: ${TEXT_FONT_SIZE}px;
    }

    .not-playing {
      text-align: center;
      width: 100%;
    }
    
    /* scrolling animation */

    .scrolling-container {
      overflow: hidden;
      white-space: nowrap;
    }

    .scrolling {
      animation: marquee 10s linear infinite;
      display: inline-block;
      padding-right: 20px;
    }

    @keyframes marquee {
      20% {
        transform: translateX(0);
      }

      100% {
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
      background: var(--green);
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

    /* /bars animation */
  `;
};
