import { RequestHandler, Response } from 'express';
import TokenMap from '../../models/token-map.model';
import User from '../../models/user.model';
import CardGetRequestQueryParams from '../../interfaces/card-get-request-query-params.interface';
import CardDeleteRequestQueryParams from '../../interfaces/card-delete-request-query-params.interface';
import { isTrack, Item } from '../../interfaces/item.interface';
import Track from '../../interfaces/track.interface';
import Artist from '../../interfaces/artist.interface';
import DataCardProps from '../../interfaces/data-card-props.interface';
import StringMap from '../../interfaces/map.interface';
import { SHORT_URL } from '../../utils/config.util';
import { boolFromString, boundedIntFromString } from '../../utils/string.util';
import { getBase64DataFromImageUrl } from '../../utils/image.util';

const DEFAULT_ITEM_COUNT = 5;
const MIN_ITEM_COUNT = 1;
const MAX_ITEM_COUNT = 10;
const CARD_VIEW_PATH = 'api/card.view.tsx';

// serves a data card
export const card_get: RequestHandler = async (req, res) => {
  // set content-type header to svg
  res.setHeader('Content-Type', 'image/svg+xml');

  // validate user id query param
  const cardReqBody = req.query as unknown as CardGetRequestQueryParams;
  const { user_id: userId } = cardReqBody;
  if (!userId) {
    serveErrorCard(res, 'Missing required parameter: user_id');
    return;
  }

  // fetch access token
  let accessToken;
  try {
    accessToken = await TokenMap.getLatestAccessToken(userId);
  } catch (error) {
    serveErrorCard(res, getGenericErrorMessage(userId));
    return;
  }

  // fetch user display name
  let userDisplayName;
  try {
    const { display_name } = await User.getUserProfile(accessToken);
    userDisplayName = display_name;
  } catch (error) {
    serveErrorCard(res, getGenericErrorMessage(userId));
    return;
  }

  // get options from query params
  const {
    custom_title: customTitle, // TODO: clean and trim
    hide_title,
    hide_playing,
    hide_recents,
    hide_top_tracks,
    hide_top_artists,
    hide_explicit,
    show_border,
    limit
  } = cardReqBody;
  const showTitle = !boolFromString(hide_title);
  const showNowPlaying = !boolFromString(hide_playing);
  const showRecentlyPlayed = !boolFromString(hide_recents);
  const showTopTracks = !boolFromString(hide_top_tracks);
  const showTopArtists = !boolFromString(hide_top_artists);
  const hideExplicit = boolFromString(hide_explicit);
  const showBorder = boolFromString(show_border);
  const itemLimit = boundedIntFromString(
    MIN_ITEM_COUNT,
    MAX_ITEM_COUNT,
    DEFAULT_ITEM_COUNT,
    limit
  );

  // serve error card if no data is visible
  if (
    !showNowPlaying &&
    !showRecentlyPlayed &&
    !showTopTracks &&
    !showTopArtists
  ) {
    serveErrorCard(
      res,
      `${userDisplayName} doesn't want to show any of their Spotify data. 🤷🏾‍♂️`
    );
    return;
  }

  // get currently playing track
  let nowPlaying = null;
  if (showNowPlaying) {
    try {
      nowPlaying = await User.getNowPlaying(accessToken, hideExplicit);
    } catch (error) {
      serveErrorCard(res, getGenericErrorMessage(userId, userDisplayName));
      return;
    }
  }

  // get recently played tracks
  let recentlyPlayed: Track[] = [];
  if (showRecentlyPlayed) {
    try {
      recentlyPlayed = await User.getRecentlyPlayed(
        accessToken,
        hideExplicit,
        itemLimit
      );
    } catch (error) {
      serveErrorCard(res, getGenericErrorMessage(userId, userDisplayName));
      return;
    }
  }

  // get top tracks
  let topTracks: Track[] = [];
  if (showTopTracks) {
    try {
      topTracks = await User.getTopTracks(accessToken, hideExplicit, itemLimit);
    } catch (error) {
      serveErrorCard(res, getGenericErrorMessage(userId, userDisplayName));
      return;
    }
  }

  // get top artists
  let topArtists: Artist[] = [];
  if (showTopArtists) {
    try {
      topArtists = await User.getTopArtists(accessToken, itemLimit);
    } catch (error) {
      serveErrorCard(res, getGenericErrorMessage(userId, userDisplayName));
      return;
    }
  }

  // serve data card
  serveCard(
    res,
    userDisplayName,
    showTitle,
    nowPlaying,
    recentlyPlayed,
    topTracks,
    topArtists,
    showNowPlaying,
    showRecentlyPlayed,
    showTopTracks,
    showTopArtists,
    hideExplicit,
    showBorder,
    itemLimit,
    customTitle
  );
};

// deletes a data card
export const card_delete: RequestHandler = async (req, res) => {
  // validate user id query param
  const { user_id: userId } =
    req.query as unknown as CardDeleteRequestQueryParams;
  if (!userId) {
    res.status(400).send('Missing required parameter: user_id');
    return;
  }

  // check that auth header exists
  const authHeader = req.header('authorization');
  if (!authHeader) {
    res.status(401).send('No token provided.');
    return;
  }

  // validate auth header scheme
  const authSchemeString = 'bearer ';
  if (!authHeader.toLowerCase().startsWith(authSchemeString)) {
    res.status(400).send('Only valid bearer authentication supported.');
    return;
  }

  // get refresh token from auth header
  const refreshToken = authHeader.substring(authSchemeString.length);
  if (!refreshToken.trim()) {
    res.status(400).send('Only valid bearer authentication supported.');
    return;
  }

  // fetch token map associated with user id
  let tokenMap;
  try {
    tokenMap = await TokenMap.getTokenMap(userId);
  } catch (error) {
    res.status(404).send('Data card not found.');
    return;
  }

  // check that original refresh token matches refresh token associated with token map
  const { refreshToken: refreshToken2 } = tokenMap;
  if (refreshToken !== refreshToken2) {
    res.status(401).send('Invalid token.');
    return;
  }

  // delete token map from db
  try {
    await TokenMap.deleteTokenMap(userId);
  } catch (error) {
    res.status(404).send('Data card not found.');
    return;
  }

  // send confirmation
  res.send('Data card deleted successfully.');
};

// helper functions

const serveCard = async (
  res: Response,
  userDisplayName: string,
  showTitle: boolean,
  nowPlaying: Track | null,
  recentlyPlayed: Track[],
  topTracks: Track[],
  topArtists: Artist[],
  showNowPlaying: boolean,
  showRecentlyPlayed: boolean,
  showTopTracks: boolean,
  showTopArtists: boolean,
  hideExplicit: boolean,
  showBorder: boolean,
  itemLimit: number,
  customTitle?: string
) => {
  // TODO: add cache-control header? (good responses only)

  const imageDataMap = await getImageDataMap([
    nowPlaying,
    ...recentlyPlayed,
    ...topTracks,
    ...topArtists
  ]);
  const dataCardProps: DataCardProps = {
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
    itemLimit
  };
  res.render(CARD_VIEW_PATH, dataCardProps);
};

const getImageDataMap = async (items: Item[]) => {
  const map: StringMap = {};
  for (const item of items) {
    if (!item) continue;
    if (isTrack(item)) {
      map[item.albumImageUrl] = await getBase64DataFromImageUrl(
        item.albumImageUrl
      );
    } else map[item.imageUrl] = await getBase64DataFromImageUrl(item.imageUrl);
  }
  return map;
};

const serveErrorCard = (res: Response, errorMessage: string) => {
  res.render(CARD_VIEW_PATH, { errorMessage });
};

const getGenericErrorMessage = (userId: string, userDisplayName?: string) => {
  return `Something went wrong! ${
    userDisplayName || `The user with ID ${userId}`
  } may need to re-generate a card at ${SHORT_URL}.`;
};
