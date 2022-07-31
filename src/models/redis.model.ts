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

  static async #getFromOrSaveToCache<T>(
    key: string,
    fallbackFunction: Function,
    expiration?: number
  ): Promise<T> {
    // attempt to fetch from cache
    let data = null;
    try {
      data = await this.#client.get(key);
    } catch (error) {
      // don't throw
      console.log(error);
    }
    if (data) {
      return JSON.parse(data);
    }

    // run fallback function
    const freshData = await fallbackFunction();

    // save to cache
    try {
      typeof expiration === 'number'
        ? await this.#client.setEx(key, expiration, JSON.stringify(freshData))
        : await this.#client.set(key, JSON.stringify(freshData));
    } catch (error) {
      console.log(error);
    }

    // resolve with fresh data
    return freshData;
  }

  // connection

  static connect() {
    return this.#client.connect();
  }

  static quit() {
    return this.#client.quit();
  }

  // token maps

  static saveTokenMapToCache(userId: string, tokenMap: ITokenMap) {
    return this.#client.set(
      getTokenMapCacheKey(userId),
      JSON.stringify(tokenMap)
    );
  }

  static async getTokenMapFromCache(userId: string): Promise<ITokenMap> {
    const tokenMap = await this.#client.get(getTokenMapCacheKey(userId));
    return JSON.parse(tokenMap || 'null');
  }

  // user data

  static saveUserProfileToCache(
    userId: string,
    profile: UserProfileResponseBody
  ) {
    return this.#client.set(
      getUserProfileCacheKey(userId),
      JSON.stringify(profile)
    );
  }

  static async getUserProfileFromCache(
    userId: string
  ): Promise<UserProfileResponseBody> {
    const profile = await this.#client.get(getUserProfileCacheKey(userId));
    return JSON.parse(profile || 'null');
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

  static async deleteTokenMapAndUserDataFromCache(
    userId: string
  ): Promise<void> {
    await this.#client.del(getTokenMapCacheKey(userId));
    await this.#client.del(getUserProfileCacheKey(userId));
    await this.#client.eval(getTopItemCacheDeletionScript(userId, 'Track'));
    await this.#client.eval(getTopItemCacheDeletionScript(userId, 'Artist'));
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
