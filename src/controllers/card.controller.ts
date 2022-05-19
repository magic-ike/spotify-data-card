import { RequestHandler, Response } from 'express';
import TokenMap from '../models/token-map.model';
import Auth from '../models/auth.model';
import CardGetRequestQueryParams from '../interfaces/card-get-request-query-params.interface';
import CardDeleteRequestQueryParams from '../interfaces/card-delete-request-query-params.interface';
import { SHORT_URL } from '../utils/constants';

// serves a data card
export const card_get: RequestHandler = async (req, res) => {
  // validate user id query param
  const cardReqBody = req.query as unknown as CardGetRequestQueryParams;
  const { user_id: userId } = cardReqBody;
  if (!userId) {
    serveErrorCard(res, 'Missing required parameter: user_id');
    return;
  }

  // fetch token map associated with user id
  let tokenMap;
  try {
    tokenMap = await TokenMap.getTokenMap(userId);
  } catch (error) {
    serveErrorCard(res, getGenericErrorMessage(userId));
    return;
  }

  // get tokens from token map and update access token if it's expired
  let { accessToken } = tokenMap;
  const { refreshToken, accessTokenExpiresAt } = tokenMap;
  if (accessTokenExpiresAt <= Date.now()) {
    // use refresh token to request new access token
    let response;
    try {
      response = await Auth.getAccessTokenWithRefreshToken(refreshToken);
    } catch (error) {
      serveErrorCard(res, getGenericErrorMessage(userId));
      return;
    }

    // save new access token to db
    const { access_token, expires_in } = response;
    try {
      await TokenMap.updateAccessTokenInTokenMap(
        userId,
        access_token,
        expires_in
      );
    } catch (error) {
      serveErrorCard(res, getGenericErrorMessage(userId));
      return;
    }

    // use new access token
    accessToken = access_token;
  }

  // serve data card
  serveCard(res, cardReqBody, accessToken);
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

// TODO: finish implementation
const serveCard = (
  res: Response,
  cardReqBody: CardGetRequestQueryParams,
  accesToken: string
) => {
  const {
    user_id: userId,
    custom_title: customTitle,
    hide_title: hideTitle,
    hide_now_playing: hideNowPlaying,
    hide_top_tracks: hideTopTracks,
    hide_top_artists: hideTopArtists,
    show_explicit_tracks: showExplicitTracks,
    track_count: trackCount,
    artist_count: artistCount
  } = cardReqBody;
  res.send(`access token: ${accesToken}`);
};

// TODO: finish implementation
const serveErrorCard = (res: Response, errorMessage: string) => {
  res.send(errorMessage);
};

const getGenericErrorMessage = (userId: string) => {
  return `Something went wrong!<br />The user with ID '${userId}' may need to re-generate a card at ${SHORT_URL}.`;
};
