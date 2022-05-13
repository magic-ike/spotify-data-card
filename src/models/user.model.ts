import axios, { AxiosError, AxiosResponse } from 'axios';
import UserProfile from '../interfaces/user-profile.interface';

export default class UserModel {
  static async saveCurrentUserId(
    accessToken: string,
    refreshToken: string
  ): Promise<[string, (Error | AxiosError)?]> {
    let response: AxiosResponse;

    try {
      response = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    } catch (error) {
      return [null, error as AxiosError];
    }

    if (response.status !== 200)
      return [
        null,
        new Error(
          `Request to save user ID failed with status code ${response.status}.`
        )
      ];

    const { id: userId } = response.data as UserProfile;

    // TODO: store userId and tokens in mongo

    return [userId];
  }
}
