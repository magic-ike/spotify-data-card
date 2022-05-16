import { stringify } from 'querystring';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { AccessTokenResponse } from '../interfaces/access-token-response.interface';

export default class Auth {
  static getAccessTokenWithAuthCode(
    clientId: string,
    clientSecret: string,
    authCode: string,
    redirectUri: string
  ) {
    return this.#getAccessToken(
      'authorization_code',
      clientId,
      clientSecret,
      authCode,
      redirectUri
    );
  }

  static getAccessTokenWithRefreshToken(
    clientId: string,
    clientSecret: string,
    refreshToken: string
  ) {
    return this.#getAccessToken(
      'refresh_token',
      clientId,
      clientSecret,
      undefined,
      undefined,
      refreshToken
    );
  }

  static #getAccessToken(
    grantType: 'authorization_code' | 'refresh_token',
    clientId: string,
    clientSecret: string,
    authCode?: string,
    redirectUri?: string,
    refreshToken?: string
  ): Promise<AccessTokenResponse> {
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
              `${clientId}:${clientSecret}`
            ).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
      } catch (error) {
        reject((error as AxiosError).message);
        return;
      }

      if (response.status !== 200) {
        reject(
          `Access token request failed with status code ${response.status}.`
        );
        return;
      }

      resolve(response.data);
    });
  }
}
