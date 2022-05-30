import { stringify } from 'querystring';
import { RequestHandler, Response } from 'express';
import Auth from '../../models/auth.model';
import User from '../../models/user.model';
import TokenMap from '../../models/token-map.model';
import { CLIENT_ID } from '../../utils/config.util';
import { getBaseUrl, getFullUrl } from '../../utils/url.util';
import { generateRandomString } from '../../utils/string.util';

const STATE_KEY = 'spotify_auth_state';

// requests user authorization
export const auth_login: RequestHandler = (req, res) => {
  const redirectUri = `${getBaseUrl(req)}/callback`;
  const scope =
    'user-read-currently-playing user-read-recently-played user-top-read';
  const state = generateRandomString(16);

  res.cookie(STATE_KEY, state, { httpOnly: true });
  res.redirect(
    'https://accounts.spotify.com/authorize?' +
      stringify({
        client_id: CLIENT_ID,
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

  const error = req.query.error;
  if (error) {
    redirectToHomePageWithError(res, error as string);
    return;
  }

  const state = req.query.state;
  const originalState = req.cookies[STATE_KEY];
  res.clearCookie(STATE_KEY, { httpOnly: true });
  if (!state || state !== originalState) {
    redirectToHomePageWithError(res, 'state_mismatch');
    return;
  }

  const authCode = req.query.code;
  if (!authCode) {
    redirectToHomePageWithError(res, 'missing_auth_code');
    return;
  }

  // fetch access token
  const redirectUri = getFullUrl(req);
  let response;
  try {
    response = await Auth.getAccessTokenWithAuthCode(
      authCode as string,
      redirectUri
    );
  } catch (error) {
    redirectToHomePageWithError(res, error as string);
    return;
  }

  // fetch user id
  const { refresh_token, access_token, expires_in } = response;
  const refreshToken = refresh_token!;
  let userId;
  try {
    const { id } = await User.getUserProfile(access_token);
    userId = id;
  } catch (error) {
    redirectToHomePageWithError(res, error as string);
    return;
  }

  // save user id and tokens to db
  try {
    await TokenMap.saveTokenMap(userId, refreshToken, access_token, expires_in);
  } catch (error) {
    redirectToHomePageWithError(res, error as string);
    return;
  }

  // return to home page to save credentials to localStorage
  redirectToHomePageWithCreds(res, userId, refreshToken);
};

// helper functions

const redirectToHomePageWithError = (res: Response, error: string) => {
  res.redirect('/#' + stringify({ error }));
};

const redirectToHomePageWithCreds = (
  res: Response,
  userId: string,
  refreshToken: string
) => {
  res.redirect(
    '/#' + stringify({ user_id: userId, refresh_token: refreshToken })
  );
};
