import { stringify } from 'querystring';
import axios, { AxiosError } from 'axios';
import AccessTokenResponseBody from '../interfaces/access-token-response-body.interface';
import { CLIENT_ID, CLIENT_SECRET } from '../config/index.config';

const AUTH_CODE = 'authorization_code';
const REFRESH_TOKEN = 'refresh_token';

export default class Auth {
  static #getAccessToken(
    grantType: typeof AUTH_CODE | typeof REFRESH_TOKEN,
    authCode?: string,
    redirectUri?: string,
    refreshToken?: string
  ): Promise<AccessTokenResponseBody> {
    return new Promise(async (resolve, reject) => {
      // choose payload based on grant type
      let data;
      if (grantType === AUTH_CODE) {
        data = {
          grant_type: grantType,
          code: authCode,
          redirect_uri: redirectUri
        };
      } else {
        data = {
          grant_type: grantType,
          refresh_token: refreshToken
        };
      }

      // fetch access token
      let response;
      try {
        response = await axios.post<AccessTokenResponseBody>(
          'https://accounts.spotify.com/api/token',
          stringify(data),
          {
            headers: {
              Authorization: `Basic ${Buffer.from(
                `${CLIENT_ID}:${CLIENT_SECRET}`
              ).toString('base64')}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
      } catch (error) {
        reject((error as AxiosError).message);
        return;
      }

      // resolve with access token
      resolve(response.data);
    });
  }

  static getAccessTokenWithAuthCode(authCode: string, redirectUri: string) {
    return this.#getAccessToken(AUTH_CODE, authCode, redirectUri);
  }

  static getAccessTokenWithRefreshToken(refreshToken: string) {
    return this.#getAccessToken(
      REFRESH_TOKEN,
      undefined,
      undefined,
      refreshToken
    );
  }
}
