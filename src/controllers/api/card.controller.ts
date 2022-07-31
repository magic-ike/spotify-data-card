import { Request, RequestHandler, Response } from 'express';
import { disableHttpCaching } from '../../middleware/http-cache.middleware';
import TokenMap from '../../models/token-map.model';
import User from '../../models/user.model';
import Image from '../../models/image.model';
import CardGetRequestQueryParams from '../../interfaces/card-get-request-query-params.interface';
import CardDeleteRequestQueryParams from '../../interfaces/card-delete-request-query-params.interface';
import Track from '../../interfaces/track.interface';
import Artist from '../../interfaces/artist.interface';
import DataCardProps from '../../interfaces/data-card-props.interface';
import { CARD_API_VIEW_PATH, SHORT_URL } from '../../utils/constant.util';
import { boolFromString, boundedIntFromString } from '../../utils/string.util';

const DEFAULT_ITEM_COUNT = 5;
const MIN_ITEM_COUNT = 1;
const MAX_ITEM_COUNT = 10;

// renders a data card
export const card_get: RequestHandler = async (req, res) => {
  // set content-type header to svg
  res.header('Content-Type', 'image/svg+xml');

  // do browser detection
  const browserIsBuggy = detectBuggyBrowser(req);

  // validate user id query param
  const cardReqBody = req.query as unknown as CardGetRequestQueryParams;
  const { user_id: userId, show_border } = cardReqBody;
  const showBorder = boolFromString(show_border);
  if (!userId) {
    renderErrorCard(
      res,
      CARD_API_ERROR_MESSAGE.NO_USER_ID,
      showBorder,
      browserIsBuggy
    );
    return;
  }

  // fetch access token
  let accessToken;
  try {
    accessToken = await TokenMap.getLatestAccessToken(userId);
  } catch (error) {
    renderErrorCard(
      res,
      getGenericErrorMessage(userId),
      showBorder,
      browserIsBuggy
    );
    return;
  }

  // fetch user display name
  let userDisplayName;
  try {
    const { display_name } = await User.getUserProfile(accessToken);
    userDisplayName = display_name;
  } catch (error) {
    renderErrorCard(
      res,
      getGenericErrorMessage(userId),
      showBorder,
      browserIsBuggy
    );
    return;
  }

  // get options from query params
  const {
    show_date,
    time_zone,
    custom_title,
    hide_title,
    hide_explicit,
    hide_playing,
    hide_recents,
    hide_top_tracks,
    hide_top_artists,
    limit
  } = cardReqBody;
  const showDate = boolFromString(show_date);
  const timeZone = time_zone?.trim();
  const customTitle = custom_title?.trim();
  const showTitle = !boolFromString(hide_title);
  const hideExplicit = boolFromString(hide_explicit);
  const showNowPlaying = !boolFromString(hide_playing);
  const showRecentlyPlayed = !boolFromString(hide_recents);
  const showTopTracks = !boolFromString(hide_top_tracks);
  const showTopArtists = !boolFromString(hide_top_artists);
  const itemLimit = boundedIntFromString(
    MIN_ITEM_COUNT,
    MAX_ITEM_COUNT,
    DEFAULT_ITEM_COUNT,
    limit
  );

  // render error card if no data is visible
  if (
    !showNowPlaying &&
    !showRecentlyPlayed &&
    !showTopTracks &&
    !showTopArtists
  ) {
    renderErrorCard(
      res,
      `${userDisplayName} doesn't want to show any of their Spotify data. 🤷🏾‍♂️`,
      showBorder,
      browserIsBuggy
    );
    return;
  }

  // fetch currently playing track
  let nowPlaying = null;
  if (showNowPlaying) {
    try {
      nowPlaying = await User.getNowPlaying(accessToken, hideExplicit);
    } catch (error) {
      renderErrorCard(
        res,
        getGenericErrorMessage(userId, userDisplayName),
        showBorder,
        browserIsBuggy
      );
      return;
    }
  }

  // fetch recently played tracks
  let recentlyPlayed: Track[] = [];
  if (showRecentlyPlayed) {
    try {
      recentlyPlayed = await User.getRecentlyPlayed(
        accessToken,
        hideExplicit,
        itemLimit
      );
    } catch (error) {
      renderErrorCard(
        res,
        getGenericErrorMessage(userId, userDisplayName),
        showBorder,
        browserIsBuggy
      );
      return;
    }
  }

  // fetch top tracks
  let topTracks: Track[] = [];
  if (showTopTracks) {
    try {
      topTracks = await User.getTopTracks(
        userId,
        accessToken,
        hideExplicit,
        itemLimit
      );
    } catch (error) {
      renderErrorCard(
        res,
        getGenericErrorMessage(userId, userDisplayName),
        showBorder,
        browserIsBuggy
      );
      return;
    }
  }

  // fetch top artists
  let topArtists: Artist[] = [];
  if (showTopArtists) {
    try {
      topArtists = await User.getTopArtists(userId, accessToken, itemLimit);
    } catch (error) {
      renderErrorCard(
        res,
        getGenericErrorMessage(userId, userDisplayName),
        showBorder,
        browserIsBuggy
      );
      return;
    }
  }

  // disable http caching if real-time data is requested
  if (showNowPlaying || showRecentlyPlayed) disableHttpCaching(res);

  // render data card
  const imageDataMap = await Image.getImageDataMap([
    nowPlaying,
    ...recentlyPlayed,
    ...topTracks,
    ...topArtists
  ]);
  const dataCardProps: DataCardProps = {
    userDisplayName,
    showBorder,
    showDate,
    timeZone,
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
    browserIsBuggy
  };
  res.render(CARD_API_VIEW_PATH, dataCardProps);
};

export const CARD_API_ERROR_MESSAGE = {
  NO_USER_ID: 'Missing required parameter: user_id',
  NO_TOKEN: 'No token provided.',
  INVALID_AUTH: 'Only valid bearer authentication supported.',
  CARD_NOT_FOUND: 'Data card not found.',
  INVALID_TOKEN: 'Invalid token.'
};
export const CARD_API_DELETION_SUCCESS_MESSAGE =
  'Data card deleted successfully.';

// deletes a data card
export const card_delete: RequestHandler = async (req, res) => {
  // validate user id query param
  const { user_id: userId } =
    req.query as unknown as CardDeleteRequestQueryParams;
  if (!userId) {
    res.status(400).send(CARD_API_ERROR_MESSAGE.NO_USER_ID);
    return;
  }

  // check that auth header exists
  const authHeader = req.header('authorization');
  if (!authHeader) {
    res.status(401).send(CARD_API_ERROR_MESSAGE.NO_TOKEN);
    return;
  }

  // validate auth header scheme
  const authSchemeString = 'bearer ';
  if (!authHeader.toLowerCase().startsWith(authSchemeString)) {
    res.status(400).send(CARD_API_ERROR_MESSAGE.INVALID_AUTH);
    return;
  }

  // get refresh token from auth header
  const refreshToken = authHeader.substring(authSchemeString.length);
  if (!refreshToken.trim()) {
    res.status(400).send(CARD_API_ERROR_MESSAGE.INVALID_AUTH);
    return;
  }

  // fetch token map associated with user id
  let tokenMap;
  try {
    tokenMap = await TokenMap.getTokenMap(userId);
  } catch (error) {
    res.status(404).send(CARD_API_ERROR_MESSAGE.CARD_NOT_FOUND);
    return;
  }

  // check that original refresh token matches refresh token associated with token map
  const { refreshToken: refreshToken2 } = tokenMap;
  if (refreshToken !== refreshToken2) {
    res.status(401).send(CARD_API_ERROR_MESSAGE.INVALID_TOKEN);
    return;
  }

  // delete token map from db
  try {
    await TokenMap.deleteTokenMap(userId);
  } catch (error) {
    res.status(404).send(CARD_API_ERROR_MESSAGE.CARD_NOT_FOUND);
    return;
  }

  // send confirmation
  res.send(CARD_API_DELETION_SUCCESS_MESSAGE);
};

// helpers

const detectBuggyBrowser = (req: Request) => {
  const userAgent = req.headers['user-agent'] ?? '';
  return (
    /\b(iPad|iPhone|iPod)\b/.test(userAgent) ||
    (/AppleWebKit/.test(userAgent) &&
      !/Chrome/.test(userAgent) &&
      !/Edge/.test(userAgent))
  );
};

const renderErrorCard = (
  res: Response,
  errorMessage: string,
  showBorder: boolean,
  browserIsBuggy: boolean
) => {
  disableHttpCaching(res);
  res.render(CARD_API_VIEW_PATH, {
    showBorder,
    browserIsBuggy,
    errorMessage
  });
};

const getGenericErrorMessage = (userId: string, userDisplayName?: string) => {
  return `Card not found! ${
    userDisplayName || `The user with ID ${userId}`
  } may need to generate/re-generate a data card at ${SHORT_URL}.`;
};
