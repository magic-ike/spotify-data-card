import React from 'react';
import moment from 'moment';
import pixelWidth from 'string-pixel-width';
import DataCardProps from '../../interfaces/data-card-props.interface';
import { Item, isTrack } from '../../interfaces/item.interface';
import StringMap from '../../interfaces/map.interface';
import { randomIntFromIntervalInclusive } from '../../utils/number.util';
import { getBase64DataFromImagePath } from '../../utils/image.util';
import { SHORT_URL, SPOTIFY_WHITE_LOGO_PATH } from '../../utils/constant.util';

// card dimensions
const BORDER_WIDTH = 3;
const CARD_SPACING = 10;
const CARD_TITLE_HEIGHT = 50;
const CARD_SUBTITLE_HEIGHT = 45;
const ATTRIBUTION_HEIGHT = 45;

// cell dimensions
const CELL_WIDTH = 300;
const CELL_HEIGHT = 70;
const RANK_WIDTH = 15;
const CONTENT_HEIGHT = CELL_HEIGHT - CARD_SPACING * 2;
const TEXT_CONTENT_WIDTH =
  CELL_WIDTH - RANK_WIDTH - CONTENT_HEIGHT - CARD_SPACING * 4;
const BAR_WIDTH = 3;
const BAR_MARGIN = 1;
const BAR_SPACE = BAR_WIDTH + BAR_MARGIN;
const BAR_COUNT = Math.ceil(TEXT_CONTENT_WIDTH / BAR_SPACE);
const EXPLICIT_TAG_WIDTH = 16;
const EXPLICIT_TAG_MARGIN = 8;
const EXPLICIT_TAG_SPACE = EXPLICIT_TAG_WIDTH + EXPLICIT_TAG_MARGIN;
const ERROR_MESSAGE_WIDTH = CELL_WIDTH * 2;

// font sizes
const CARD_TITLE_FONT_SIZE = 25;
const CARD_SUBTITLE_FONT_SIZE = 20;
const BIG_TEXT_FONT_SIZE = 16;
const TEXT_FONT_SIZE = 14;

export default function DataCard({
  userDisplayName,
  showBorder,
  showDate,
  customTitle,
  showTitle,
  hideExplicit,
  showNowPlaying,
  nowPlaying,
  showRecentlyPlayed,
  recentlyPlayed,
  showTopTracks,
  topTracks,
  showTopArtists,
  topArtists,
  imageDataMap,
  itemLimit,
  errorMessage
}: DataCardProps) {
  // set card title
  const cardTitle =
    errorMessage ||
    customTitle ||
    `${userDisplayName}'s Spotify Data` +
      (showDate ? ` on ${moment().format('MM/DD/YYYY [at] h:mm A')}` : '') +
      (hideExplicit ? ' (Clean)' : '');

  // calculate card size
  let cardWidth = 0;
  let cardHeight = ATTRIBUTION_HEIGHT;
  if (errorMessage) {
    cardWidth += ERROR_MESSAGE_WIDTH;
    cardHeight += CARD_TITLE_HEIGHT;
  } else {
    // card width
    let minCardWidth = cardWidth + CELL_WIDTH;
    for (const option of [showRecentlyPlayed, showTopTracks, showTopArtists]) {
      if (!option) continue;
      cardWidth += CELL_WIDTH;
    }
    cardWidth = Math.max(cardWidth, minCardWidth);

    // card height
    if (showTitle) cardHeight += CARD_TITLE_HEIGHT;
    if (showNowPlaying) cardHeight += CARD_SUBTITLE_HEIGHT + CELL_HEIGHT;
    if (showRecentlyPlayed || showTopTracks || showTopArtists)
      cardHeight += CARD_SUBTITLE_HEIGHT + CELL_HEIGHT * itemLimit;
  }

  // get card size with spacing added
  const [finalCardWidth, finalCardHeight] = getFinalCardDimensions(
    cardWidth,
    cardHeight,
    showBorder
  );

  return (
    <svg
      width={finalCardWidth}
      height={finalCardHeight}
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
            style={{
              border: showBorder ? `${BORDER_WIDTH}px solid white` : undefined
            }}
          >
            <div
              className={
                'card-title scrolling-container' +
                (errorMessage ? ' error-message' : '')
              }
              style={{
                display: showTitle || errorMessage ? undefined : 'none'
              }}
            >
              {textOverflows(cardTitle, CARD_TITLE_FONT_SIZE, cardWidth) ? (
                <>
                  <div id="title" className="scrolling">
                    {cardTitle}
                  </div>
                  <div className="scrolling" aria-hidden="true">
                    {cardTitle}
                  </div>
                </>
              ) : (
                <div id="title">{cardTitle}</div>
              )}
            </div>

            {!errorMessage && (
              <>
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
                      {recentlyPlayed.length ? (
                        recentlyPlayed.map((track, i) => (
                          <DataCardCell
                            item={track}
                            imageDataMap={imageDataMap}
                            rank={i + 1}
                            key={`recent-${i}`}
                          />
                        ))
                      ) : (
                        <DataCardCell
                          item={null}
                          imageDataMap={imageDataMap}
                          rank={1}
                        />
                      )}
                    </section>
                  )}

                  {showTopTracks && (
                    <section>
                      <div className="card-subtitle">Top Tracks</div>
                      {topTracks.length ? (
                        topTracks.map((track, i) => (
                          <DataCardCell
                            item={track}
                            imageDataMap={imageDataMap}
                            rank={i + 1}
                            key={`top-track-${i}`}
                          />
                        ))
                      ) : (
                        <DataCardCell
                          item={null}
                          imageDataMap={imageDataMap}
                          rank={1}
                        />
                      )}
                    </section>
                  )}

                  {showTopArtists && (
                    <section>
                      <div className="card-subtitle">Top Artists</div>
                      {topArtists.length ? (
                        topArtists.map((artist, i) => (
                          <DataCardCell
                            item={artist}
                            imageDataMap={imageDataMap}
                            rank={i + 1}
                            key={`top-artist-${i}`}
                          />
                        ))
                      ) : (
                        <DataCardCell
                          item={null}
                          imageDataMap={imageDataMap}
                          rank={1}
                        />
                      )}
                    </section>
                  )}
                </div>
              </>
            )}

            <div className="attribution">
              <SafeLink className="spotify-link" href="https://www.spotify.com">
                <img
                  className="spotify-logo"
                  src={
                    'data:image/png;base64,' +
                    getBase64DataFromImagePath(
                      `src/public${SPOTIFY_WHITE_LOGO_PATH}`
                    )
                  }
                  alt="spotify.com"
                />
              </SafeLink>
              <div className="short-url">{SHORT_URL}</div>
            </div>
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
  const CellContainer = item ? SafeLink : 'div';
  const cellTitle = item
    ? isTrack(item)
      ? item.title
      : item.name
    : rank
    ? 'None'
    : 'Nothing';
  const cellSubtitle = isTrack(item)
    ? `${item.artist} • ${item.albumTitle}`
    : '';
  const cellSubtitleJSX = (
    <div className="track-subtitle-container">
      {isTrack(item) && item.explicit && <div className="explicit-tag">E</div>}
      {cellSubtitle}
    </div>
  );

  return (
    <CellContainer className="cell-container" href={item?.url}>
      {item ? (
        <>
          <div className="rank big-text">
            {isTopItem(item, rank) ? rank : '🔊'}
          </div>
          <img
            className="cover"
            src={
              'data:image/jpeg;base64,' +
              imageDataMap[isTrack(item) ? item.albumImageUrl : item.imageUrl]
            }
            width={CONTENT_HEIGHT}
            height={CONTENT_HEIGHT}
          />
          <div className="text-container">
            <div
              className={
                (isTrack(item) ? 'track-title' : 'big-text') +
                ' scrolling-container'
              }
            >
              {textOverflows(
                cellTitle,
                isTrack(item) ? TEXT_FONT_SIZE : BIG_TEXT_FONT_SIZE,
                TEXT_CONTENT_WIDTH
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
                    TEXT_CONTENT_WIDTH,
                    item.explicit ? EXPLICIT_TAG_SPACE : undefined
                  ) ? (
                    <>
                      <div className="scrolling">{cellSubtitleJSX}</div>
                      <div className="scrolling" aria-hidden="true">
                        {cellSubtitleJSX}
                      </div>
                    </>
                  ) : (
                    cellSubtitleJSX
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

const SafeLink = ({
  className,
  href,
  children
}: {
  className?: string;
  href?: string;
  children?: React.ReactNode;
}) => {
  return (
    <a className={className} href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
};

// helpers

const isNowPlaying = (item: Item, rank?: number) => {
  return isTrack(item) && typeof rank === 'undefined';
};

const isTopItem = (item: Item, rank?: number) => {
  return item && typeof rank === 'number';
};

const getFinalCardDimensions = (
  width: number,
  height: number,
  showBorder: boolean
) => {
  const paddingSpace = CARD_SPACING * 2;
  const borderSpace = showBorder ? BORDER_WIDTH * 2 : 0;
  const totalExtraSpace = paddingSpace + borderSpace;
  return [width + totalExtraSpace, height + totalExtraSpace];
};

const textOverflows = (
  text: string,
  size: number,
  maxWidth: number,
  extraWidth?: number
) => {
  const width =
    pixelWidth(text, {
      font: 'arial',
      size: size,
      bold: true // adds extra width to slightly overestimate
    }) + (extraWidth ?? 0);
  return width > maxWidth;
};

const generateBarContent = () => {
  let barContent: JSX.Element[] = [];
  for (let i = 0; i < BAR_COUNT; i++)
    barContent.push(<div className="bar" key={`bar-${i}`}></div>);
  return barContent;
};

const generateBarCSS = () => {
  let barCSS = '';
  let left = 0;
  for (let i = 1; i <= BAR_COUNT; i++) {
    const anim = randomIntFromIntervalInclusive(350, 500);
    barCSS += `.bar:nth-child(${i}) { left: ${left}px; animation-duration: ${anim}ms; }`;
    left += BAR_SPACE;
  }
  return barCSS;
};

const generateDataCardCellCSS = () => {
  return `
    * {
      color: inherit;
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
      border-radius: 20px;
      overflow: hidden;
    }

    .attribution {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: ${ATTRIBUTION_HEIGHT}px;
    }

    .spotify-link,
    .spotify-logo {
      height: 100%;
    }

    .short-url {
      font-size: ${BIG_TEXT_FONT_SIZE}px;
    }

    .error-message {
      color: red !important;
    }

    .card-title {
      font-size: ${CARD_TITLE_FONT_SIZE}px;
      font-weight: 700;
      line-height: ${CARD_TITLE_HEIGHT - CARD_SPACING * 2}px;
      height: ${CARD_TITLE_HEIGHT}px;
    }

    .card-subtitle {
      font-size: ${CARD_SUBTITLE_FONT_SIZE}px;
      line-height: ${CARD_SUBTITLE_HEIGHT - CARD_SPACING * 2}px;
      height: ${CARD_SUBTITLE_HEIGHT}px;
    }

    .card-title,
    .card-subtitle {
      text-align: center;
    }

    .explicit-tag {
      background-color: var(--light-gray);
      color: var(--black);
      font-size: 10px;
      text-align: center;
      line-height: ${EXPLICIT_TAG_WIDTH}px;
      width: ${EXPLICIT_TAG_WIDTH}px;
      height: ${EXPLICIT_TAG_WIDTH}px;
      border-radius: 2px;
      margin-right: ${EXPLICIT_TAG_MARGIN}px;
    }

    .attribution,
    .card-title,
    .card-subtitle {
      border: ${CARD_SPACING}px solid var(--black);
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
      width: ${CELL_WIDTH}px;
      height: ${CELL_HEIGHT}px;
      display: flex;
      align-items: center;
      gap: ${CARD_SPACING}px;
    }

    .cell-container:hover {
      background-color: var(--gray);
    }

    .cell-container:hover
    .explicit-tag {
      color: var(--gray);
    }

    .card-container,
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

    .text-container {
      width: ${TEXT_CONTENT_WIDTH}px;
    }

    .track-title {
      margin-bottom: 3px;
    }

    .track-subtitle-container {
      display: flex;
      align-items: center;
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
      width: ${TEXT_CONTENT_WIDTH}px;
      height: 6px;
      overflow: hidden;
      margin: -6px 0 0 0;
    }

    .bar {
      background-color: var(--green);
      width: ${BAR_WIDTH}px;
      height: 3px;
      position: absolute;
      bottom: 1px;
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
