import axios, { AxiosError, AxiosResponse } from 'axios';
import UserProfile from '../interfaces/user-profile.interface';

export default class User {
  static getUserId(accessToken: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      let response: AxiosResponse;

      try {
        response = await axios.get('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
      } catch (error) {
        reject((error as AxiosError).message);
        return;
      }

      const { id } = response.data as UserProfile;
      resolve(id);
    });
  }
}
