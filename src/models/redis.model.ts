import { createClient } from 'redis';
import { REDIS_URI } from '../config/index.config';
import ITokenMap from '../interfaces/token-map.interface';
import UserProfileResponseBody from '../interfaces/user-profile-response-body.interface';
import Track from '../interfaces/track.interface';
import Artist from '../interfaces/artist.interface';

const DEFAULT_EXPIRATION = 60 * 60 * 24; // 1 day
const TOKEN_MAPS = 'tokenMaps:';
const PROFILES = 'profiles:';
const TOP_TRACKS = 'topTracks:';
const HIDE_EXPLICIT = 'hideExp:';
const SHOW_EXPLICIT = 'showExp:';
const TOP_ARTISTS = 'topArtists:';
const IMAGES = 'images:';

export default class Redis {
  // private

  static #client = createClient({ url: REDIS_URI });

  static #getFromOrSaveToCache<T>(
    key: string,
    fallbackFunction: Function,
    expiration?: number
  ): Promise<T> {
    return new Promise(async (resolve, reject) => {
      // attempt to fetch from cache
      let data = null;
      try {
        data = await this.#client.get(key);
      } catch (error) {
        // don't reject
        console.log(error);
      }
      if (data) {
        resolve(JSON.parse(data));
        return;
      }

      // run fallback function
      let freshData;
      try {
        freshData = await fallbackFunction();
      } catch (error) {
        reject(error);
        return;
      }
      resolve(freshData);

      // save to cache
      try {
        if (typeof expiration === 'number') {
          await this.#client.setEx(key, expiration, JSON.stringify(freshData));
        } else {
          await this.#client.set(key, JSON.stringify(freshData));
        }
      } catch (error) {
        // don't reject
        console.log(error);
      }
    });
  }

  // connection

  static connect() {
    this.#client.connect();
  }

  // token maps

  static saveTokenMapToCache(
    userId: string,
    tokenMap: ITokenMap
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.#client.set(
          getTokenMapCacheKey(userId),
          JSON.stringify(tokenMap)
        );
      } catch (error) {
        reject(error);
        return;
      }
      resolve();
    });
  }

  static getTokenMapFromCache(userId: string): Promise<ITokenMap> {
    return new Promise(async (resolve, reject) => {
      let tokenMap;
      try {
        tokenMap = await this.#client.get(getTokenMapCacheKey(userId));
      } catch (error) {
        reject(error);
        return;
      }
      resolve(JSON.parse(tokenMap || 'null'));
    });
  }

  // user data

  static saveUserProfileToCache(
    userId: string,
    profile: UserProfileResponseBody
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.#client.set(
          getUserProfileCacheKey(userId),
          JSON.stringify(profile)
        );
      } catch (error) {
        reject(error);
        return;
      }
      resolve();
    });
  }

  static getUserProfileFromCache(
    userId: string
  ): Promise<UserProfileResponseBody> {
    return new Promise(async (resolve, reject) => {
      let profile;
      try {
        profile = await this.#client.get(getUserProfileCacheKey(userId));
      } catch (error) {
        reject(error);
        return;
      }
      resolve(JSON.parse(profile || 'null'));
    });
  }

  static getTopTracksFromOrSaveToCache(
    userId: string,
    hideExplicit: boolean,
    limit: number,
    fallbackFunction: Function
  ): Promise<Track[]> {
    return this.#getFromOrSaveToCache(
      getTopTracksCacheKey(userId, hideExplicit, limit),
      fallbackFunction,
      DEFAULT_EXPIRATION
    );
  }

  static getTopArtistsFromOrSaveToCache(
    userId: string,
    limit: number,
    fallbackFunction: Function
  ): Promise<Artist[]> {
    return this.#getFromOrSaveToCache(
      getTopArtistsCacheKey(userId, limit),
      fallbackFunction,
      DEFAULT_EXPIRATION
    );
  }

  // images

  static getImageDataFromOrSaveToCache(
    imageId: string,
    fallbackFunction: Function
  ): Promise<string> {
    return this.#getFromOrSaveToCache(
      getImageCacheKey(imageId),
      fallbackFunction
    );
  }

  // misc

  static deleteTokenMapAndUserDataFromCache(userId: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.#client.del(getTokenMapCacheKey(userId));
        await this.#client.del(getUserProfileCacheKey(userId));
        await this.#client.eval(getTopItemCacheDeletionScript(userId, 'Track'));
        await this.#client.eval(
          getTopItemCacheDeletionScript(userId, 'Artist')
        );
      } catch (error) {
        reject(error);
        return;
      }
      resolve();
    });
  }
}

// helpers

const getTokenMapCacheKey = (userId: string) => {
  return TOKEN_MAPS + userId;
};

const getUserProfileCacheKey = (userId: string) => {
  return PROFILES + userId;
};

const getTopTracksCacheKey = (
  userId: string,
  hideExplicit: boolean,
  limit: number
) => {
  return (
    TOP_TRACKS +
    `${userId}:` +
    (hideExplicit ? HIDE_EXPLICIT : SHOW_EXPLICIT) +
    limit
  );
};

const getTopArtistsCacheKey = (userId: string, limit: number) => {
  return TOP_ARTISTS + `${userId}:` + limit;
};

const getImageCacheKey = (imageId: string) => {
  return IMAGES + imageId;
};

const getTopItemCacheDeletionScript = (
  userId: string,
  type: 'Track' | 'Artist'
): string => {
  return `for _, k in ipairs(redis.call('keys', '${
    type === 'Track' ? TOP_TRACKS : TOP_ARTISTS
  }${userId}:*')) do redis.call('del', k) end`;
};
