import { stringify } from 'querystring';
import { RequestHandler } from 'express';
import axios from 'axios';
import { getBaseUrl, getFullUrl } from '../utils/url';
import { generateRandomString } from '../utils/string';

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const stateKey = 'spotify_auth_state';

// requests user authorization
export const auth_login: RequestHandler = (req, res) => {
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
export const auth_callback: RequestHandler = async (req, res) => {
  const error = (req.query.error as string) || null;
  if (error) {
    res.redirect(
      '/?' +
        stringify({
          error: error
        })
    );
    return;
  }

  // TODO: actually check for state mismatch
  const state = (req.query.state as string) || null;
  if (!state) {
    res.redirect(
      '/?' +
        stringify({
          error: 'state_mismatch'
        })
    );
    return;
  }

  const code = (req.query.code as string) || null;
  const redirectUri = getFullUrl(req);
  try {
    const response = await axios({
      method: 'POST',
      url: 'https://accounts.spotify.com/api/token',
      data: stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      }),
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`
        ).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.status === 200) {
      // TODO: request uid and store uid-refresh token pair in redis
      res.send(JSON.stringify(response.data));
    } else {
      res.send(response);
    }
  } catch (error) {
    res.send(error);
  }
};

// TODO: move to api router
// uses refresh token to request refreshed access token
export const auth_refresh_token: RequestHandler = (_req, res) => {
  res.send('GET /auth/refresh_token works');
};
