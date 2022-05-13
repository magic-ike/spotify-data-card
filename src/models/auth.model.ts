import { stringify } from 'querystring';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { AccessTokenResponse } from '../interfaces/access-token-response.interface';

type GrantType = 'authorization_code' | 'refresh_token';

export default class AuthModel {
  static async getAccessTokenWithAuthCode(
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

  static async getAccessTokenWithRefreshToken(
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

  static async #getAccessToken(
    grantType: GrantType,
    clientId: string,
    clientSecret: string,
    authCode?: string,
    redirectUri?: string,
    refreshToken?: string
  ): Promise<[AccessTokenResponse, (Error | AxiosError)?]> {
    let response: AxiosResponse;
    let data = {};

    try {
      if (grantType === 'authorization_code') {
        data = {
          grant_type: grantType,
          code: authCode,
          redirect_uri: redirectUri
        };
      } else if (grantType === 'refresh_token') {
        data = {
          grant_type: grantType,
          refresh_token: refreshToken
        };
      } else {
        throw new Error(
          `Expected 'grant_type' of 'authorization_code' or 'refresh_token'. Instead got '${grantType}'.`
        );
      }

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
      return [null, error as Error | AxiosError];
    }

    if (response.status !== 200)
      return [
        null,
        new Error(
          `Access token request failed with status code ${response.status}.`
        )
      ];

    return [response.data];
  }
}
