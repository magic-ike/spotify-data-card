import { stringify } from 'querystring';
import { RequestHandler, Response } from 'express';
import AuthModel from '../models/auth.model';
import { AccessTokenResponse } from '../interfaces/access-token-response.interface';
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

  res.cookie(stateKey, state);
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
  // TODO: handle errors on home page
  const error = (req.query.error as string) || null;
  if (error) {
    redirectToHomePageWithError(res, error);
    return;
  }

  // TODO: actually check for state mismatch
  const state = (req.query.state as string) || null;
  if (!state) {
    redirectToHomePageWithError(res, 'state_mismatch');
    return;
  }

  const authCode = (req.query.code as string) || null;
  if (!authCode) {
    redirectToHomePageWithError(res, 'missing_auth_code');
    return;
  }

  const redirectUri = getFullUrl(req);
  const [data, errorOrBadResponse] = await AuthModel.getAccessTokenWithAuthCode(
    clientId,
    clientSecret,
    authCode,
    redirectUri
  );
  if (errorOrBadResponse) {
    redirectToHomePageWithError(res, errorOrBadResponse);
    return;
  }

  const { access_token, refresh_token } = data as AccessTokenResponse;
  // TODO: use user model to store uid and tokens in redis
  res.send(JSON.stringify({ access_token, refresh_token }));
};

// helper functions

const redirectToHomePageWithError = (res: Response, error: string) => {
  res.redirect(
    '/?' +
      stringify({
        error: error
      })
  );
};
