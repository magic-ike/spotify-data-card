import Redis from './redis.model';
import { Item, isTrack } from '../interfaces/item.interface';
import StringMap from '../interfaces/map.interface';
import { getBase64DataFromImageUrl } from '../utils/image.util';

export default class Image {
  static async getImageDataMap(items: Item[]) {
    const map: StringMap = {};
    for (const item of items) {
      if (!item) continue;
      const imageUrl = isTrack(item) ? item.albumImageUrl : item.imageUrl;
      const imageUrlArray = imageUrl.split('/');
      const imageId = imageUrlArray[imageUrlArray.length - 1];
      map[imageUrl] = await Redis.getImageDataFromOrSaveToCache(imageId, () => {
        return getBase64DataFromImageUrl(imageUrl);
      });
    }
    return map;
  }
}
