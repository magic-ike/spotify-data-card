import { stringify } from 'querystring';
import { RequestHandler, Response } from 'express';
import AuthModel from '../models/auth.model';
import UserModel from '../models/user.model';
import { getBaseUrl, getFullUrl } from '../utils/url';
import { generateRandomString } from '../utils/string';

const clientId = process.env.CLIENT_ID as string;
const clientSecret = process.env.CLIENT_SECRET as string;
const stateKey = 'spotify_auth_state';

// requests user authorization
export const auth_page_login: RequestHandler = (req, res) => {
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

// uses auth code to request access token and refresh token
export const auth_page_callback: RequestHandler = async (req, res) => {
  const errorString = (req.query.error as string) || null;
  if (errorString) {
    redirectToHomePageWithError(res, errorString);
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

  const redirectUri = getFullUrl(req);
  const [data, error1] = await AuthModel.getAccessTokenWithAuthCode(
    clientId,
    clientSecret,
    authCode,
    redirectUri
  );
  if (error1) {
    redirectToHomePageWithError(res, error1.message);
    return;
  }

  const { access_token, refresh_token } = data;
  const [userId, error2] = await UserModel.saveCurrentUserId(
    access_token,
    refresh_token as string
  );
  if (error2) {
    redirectToHomePageWithError(res, error2.message);
    return;
  }

  redirectToHomePageWithUserId(res, userId);
};

// helper functions

const redirectToHomePageWithError = (res: Response, error: string) => {
  res.redirect('/#' + stringify({ error }));
};

const redirectToHomePageWithUserId = (res: Response, userId: string) => {
  res.redirect('/#' + stringify({ userId }));
};
