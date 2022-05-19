import { stringify } from 'querystring';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { AccessTokenResponseBody } from '../interfaces/access-token-response-body.interface';
import { CLIENT_ID, CLIENT_SECRET } from '../utils/constants';

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
      let response: AxiosResponse;
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

      try {
        response = await axios({
          method: 'POST',
          url: 'https://accounts.spotify.com/api/token',
          data: stringify(data),
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${CLIENT_ID}:${CLIENT_SECRET}`
            ).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
      } catch (error) {
        reject((error as AxiosError).message);
        return;
      }

      resolve(response.data);
    });
  }
}
