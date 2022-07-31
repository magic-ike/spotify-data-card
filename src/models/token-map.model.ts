import { model, models, Schema } from 'mongoose';
import Redis from '../models/redis.model';
import Auth from './auth.model';
import ITokenMap from '../interfaces/token-map.interface';
import { msFromDateString } from '../utils/string.util';

const tokenMapSchema = new Schema<ITokenMap>(
  {
    userId: {
      type: String,
      required: true
    },
    refreshToken: {
      type: String,
      required: true
    },
    accessToken: {
      type: String,
      required: true
    },
    accessTokenExpiresAt: {
      type: Date,
      required: true,
      get: msFromDateString
    }
  },
  { timestamps: true }
);

const MongoTokenMap =
  models['Token Map'] || // fixes model overwrite error
  model<ITokenMap>('Token Map', tokenMapSchema);

export default class TokenMap extends MongoTokenMap {
  // extra methods (defined later)
  static getLatestAccessToken: (userId: string) => Promise<string>;

  static async saveTokenMap(
    userId: string,
    refreshToken: string,
    accessToken: string,
    expiresIn: number
  ): Promise<ITokenMap> {
    let tokenMap;
    try {
      tokenMap = await this.findOneAndUpdate<ITokenMap>(
        { userId },
        {
          userId,
          refreshToken,
          accessToken,
          accessTokenExpiresAt: Date.now() + expiresIn * 1000
        },
        {
          returnOriginal: false,
          upsert: true
        }
      ).exec();
    } catch (error) {
      throw (error as Error).message;
    }

    // save to cache
    try {
      await Redis.saveTokenMapToCache(userId, tokenMap);
    } catch (error) {
      console.log(error);
    }

    return tokenMap;
  }

  static async getTokenMap(userId: string): Promise<ITokenMap> {
    let tokenMap;
    try {
      tokenMap = await this.findOne<ITokenMap>({ userId }).exec();
    } catch (error) {
      throw (error as Error).message;
    }
    if (!tokenMap) throw `Token map with user ID '${userId}' doesn't exist.`;
    return tokenMap;
  }

  static async updateAccessTokenInTokenMap(
    userId: string,
    accessToken: string,
    expiresIn: number
  ): Promise<ITokenMap> {
    let tokenMap;
    try {
      tokenMap = await this.findOneAndUpdate<ITokenMap>(
        { userId },
        {
          accessToken,
          accessTokenExpiresAt: Date.now() + expiresIn * 1000
        },
        { returnOriginal: false }
      ).exec();
    } catch (error) {
      throw (error as Error).message;
    }
    if (!tokenMap) throw `Token map with user ID '${userId}' doesn't exist.`;

    // save to cache
    try {
      await Redis.saveTokenMapToCache(userId, tokenMap);
    } catch (error) {
      console.log(error);
    }

    return tokenMap;
  }

  static async deleteTokenMap(userId: string): Promise<ITokenMap> {
    let tokenMap;
    try {
      tokenMap = await this.findOneAndDelete<ITokenMap>({ userId }).exec();
    } catch (error) {
      throw (error as Error).message;
    }
    if (!tokenMap) {
      throw `Token map with user ID '${userId}' didn't exist.`;
    }

    // delete from cache
    try {
      await Redis.deleteTokenMapAndUserDataFromCache(userId);
    } catch (error) {
      console.log(error);
    }

    return tokenMap;
  }
}

// extra method definitions

TokenMap.getLatestAccessToken = async function (
  userId: string
): Promise<string> {
  // attempt to fetch token map from cache
  let cachedTokenMap = null;
  try {
    cachedTokenMap = await Redis.getTokenMapFromCache(userId);
  } catch (error) {
    console.log(error);
  }

  // fetch token map from db if necessary
  let tokenMap;
  let cacheHit = false;
  if (cachedTokenMap) {
    cachedTokenMap.accessTokenExpiresAt = msFromDateString(
      cachedTokenMap.accessTokenExpiresAt as string
    );
    tokenMap = cachedTokenMap;
    cacheHit = true;
  } else {
    tokenMap = await this.getTokenMap(userId);
  }

  // get tokens from token map and update access token if it's expired
  let { accessToken } = tokenMap;
  const { refreshToken, accessTokenExpiresAt } = tokenMap;
  if (accessTokenExpiresAt <= Date.now()) {
    const { access_token, expires_in } =
      await Auth.getAccessTokenWithRefreshToken(refreshToken);
    await this.updateAccessTokenInTokenMap(userId, access_token, expires_in);
    accessToken = access_token;
  }

  // save token map to cache if necessary
  if (!cacheHit) {
    try {
      await Redis.saveTokenMapToCache(userId, tokenMap);
    } catch (error) {
      console.log(error);
    }
  }

  // resolve with access token
  return accessToken;
};
