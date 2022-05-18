import { RequestHandler, Response } from 'express';
import TokenMap from '../models/token-map.model';
import Auth from '../models/auth.model';
import CardRequestBody from '../interfaces/card-request-body.interface';
import { SHORT_URL } from '../utils/constants';

export const card_index: RequestHandler = async (req, res) => {
  // validate user id query param
  const cardReqBody = req.query as unknown as CardRequestBody;
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

// helper functions

// TODO: finish implementation
const serveCard = (
  res: Response,
  cardReqBody: CardRequestBody,
  accesToken: string
) => {
  const {
    user_id: userId,
    hide_now_playing: hideNowPlaying,
    hide_top_tracks: hideTopTracks,
    hide_top_artists: hideTopArtists,
    show_explicit_tracks: showExplicitTracks
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
