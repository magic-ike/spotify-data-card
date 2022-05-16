import { stringify } from 'querystring';
import { RequestHandler, Response } from 'express';
import Auth from '../models/auth.model';
import User from '../models/user.model';
import TokenMap from '../models/token-map.model';
import { getBaseUrl, getFullUrl } from '../utils/url';
import { generateRandomString } from '../utils/string';

const clientId = process.env.SPOTIFY_CLIENT_ID as string;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET as string;
const stateKey = 'spotify_auth_state';

// requests user authorization
export const auth_login: RequestHandler = (req, res) => {
  const redirectUri = `${getBaseUrl(req)}/callback`;
  const scope = 'user-read-currently-playing user-top-read';
  const state = generateRandomString(16);

  res.cookie(stateKey, state, { httpOnly: true });
  res.redirect(
    'https://accounts.spotify.com/authorize?' +
      stringify({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        scope: scope,
        state: state
      })
  );
};

// uses auth code to request and save access and refresh tokens
export const auth_callback: RequestHandler = async (req, res) => {
  // validate query params

  const error = (req.query.error as string) || null;
  if (error) {
    redirectToHomePageWithError(res, error);
    return;
  }

  const state = (req.query.state as string) || null;
  const originalState = req.cookies[stateKey];
  res.clearCookie(stateKey, { httpOnly: true });
  if (!state || state !== originalState) {
    redirectToHomePageWithError(res, 'state_mismatch');
    return;
  }

  const authCode = (req.query.code as string) || null;
  if (!authCode) {
    redirectToHomePageWithError(res, 'missing_auth_code');
    return;
  }

  // get access token
  const redirectUri = getFullUrl(req);
  let response;
  try {
    response = await Auth.getAccessTokenWithAuthCode(
      clientId,
      clientSecret,
      authCode,
      redirectUri
    );
  } catch (error) {
    redirectToHomePageWithError(res, error as string);
    return;
  }

  // get user id
  const { refresh_token, access_token, expires_in } = response;
  let userId;
  try {
    userId = await User.getUserId(access_token);
  } catch (error) {
    redirectToHomePageWithError(res, error as string);
    return;
  }

  // save user id and tokens to db
  const filter = { userId };
  const tokenMapData = {
    userId,
    refreshToken: refresh_token,
    accessToken: access_token,
    accessTokenExpiresAt: Date.now() + expires_in * 1000
  };
  try {
    await TokenMap.findOneAndUpdate(filter, tokenMapData, {
      returnOriginal: false, // in case the updated document needs to be used
      upsert: true
    });
  } catch (error) {
    redirectToHomePageWithError(res, (error as Error).message);
    return;
  }

  // return to home page to save user id to localStorage
  redirectToHomePageWithUserId(res, userId);
};

// helper functions

const redirectToHomePageWithError = (res: Response, error: string) => {
  res.redirect('/#' + stringify({ error }));
};

const redirectToHomePageWithUserId = (res: Response, userId: string) => {
  res.redirect('/#' + stringify({ userId }));
};
