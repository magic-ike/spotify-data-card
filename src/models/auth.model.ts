import { stringify } from 'querystring';
import axios, { AxiosError } from 'axios';
import AccessTokenResponseBody from '../interfaces/access-token-response-body.interface';
import { CLIENT_ID, CLIENT_SECRET } from '../utils/config';

export default class Auth {
  static getAccessTokenWithAuthCode(authCode: string, redirectUri: string) {
    return this.#getAccessToken('authorization_code', authCode, redirectUri);
  }

  static getAccessTokenWithRefreshToken(refreshToken: string) {
    return this.#getAccessToken(
      'refresh_token',
      undefined,
      undefined,
      refreshToken
    );
  }

  static #getAccessToken(
    grantType: 'authorization_code' | 'refresh_token',
    authCode?: string,
    redirectUri?: string,
    refreshToken?: string
  ): Promise<AccessTokenResponseBody> {
    return new Promise(async (resolve, reject) => {
      // choose payload based on grant type
      let data = {};
      if (grantType === 'authorization_code') {
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
}
