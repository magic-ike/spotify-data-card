import { model, Schema } from 'mongoose';
import ITokenMap from '../interfaces/token-map.interface';

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
      get: (v: string) => Date.parse(v)
    }
  },
  { timestamps: true }
);

const MongoTokenMap = model<ITokenMap>('Token Map', tokenMapSchema);

export default class TokenMap extends MongoTokenMap {
  static saveTokenMap(
    userId: string,
    refreshToken: string,
    accessToken: string,
    expiresIn: number
  ): Promise<ITokenMap> {
    return new Promise(async (resolve, reject) => {
      let tokenMap: ITokenMap;
      try {
        tokenMap = await this.findOneAndUpdate(
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
        reject((error as Error).message);
        return;
      }
      resolve(tokenMap);
    });
  }

  static getTokenMap(userId: string): Promise<ITokenMap> {
    return new Promise(async (resolve, reject) => {
      let tokenMap: ITokenMap | null;
      try {
        tokenMap = await this.findOne({ userId }).exec();
      } catch (error) {
        reject((error as Error).message);
        return;
      }
      if (!tokenMap) {
        reject(`Token map with user ID '${userId}' doesn't exist.`);
        return;
      }
      resolve(tokenMap);
    });
  }

  static updateAccessTokenInTokenMap(
    userId: string,
    accessToken: string,
    expiresIn: number
  ): Promise<ITokenMap> {
    return new Promise(async (resolve, reject) => {
      let tokenMap: ITokenMap | null;
      try {
        tokenMap = await this.findOneAndUpdate(
          { userId },
          {
            accessToken,
            accessTokenExpiresAt: Date.now() + expiresIn * 1000
          },
          { returnOriginal: false }
        ).exec();
      } catch (error) {
        reject((error as Error).message);
        return;
      }
      if (!tokenMap) {
        reject(`Token map with user ID '${userId}' doesn't exist.`);
        return;
      }
      resolve(tokenMap);
    });
  }

  static deleteTokenMap(userId: string): Promise<ITokenMap> {
    return new Promise(async (resolve, reject) => {
      let tokenMap: ITokenMap | null;
      try {
        tokenMap = await this.findOneAndDelete({ userId }).exec();
      } catch (error) {
        reject((error as Error).message);
        return;
      }
      if (!tokenMap) {
        reject(`Token map with user ID '${userId}' never existed.`);
        return;
      }
      resolve(tokenMap);
    });
  }
}
