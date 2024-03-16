import Redis from './redis.model';
import { Item, isTrack } from '../interfaces/item.interface';
import StringMap from '../interfaces/string-map.interface';
import { getBase64DataFromImageUrl } from '../utils/image.util';

export default class Image {
  static async getImageDataMap(items: Item[]) {
    const map: StringMap = {};
    const tasks: Promise<string>[] = [];
    for (const item of items) {
      if (!item) continue;
      const imageUrl = isTrack(item) ? item.albumImageUrl : item.imageUrl;
      const imageUrlArray = imageUrl.split('/');
      const imageId = imageUrlArray[imageUrlArray.length - 1];
      tasks.push(
        Redis.getImageDataFromCacheOrGetAndSaveToCache(imageId, () =>
          getBase64DataFromImageUrl(imageUrl)
        ).then((imageData) => (map[imageUrl] = imageData))
      );
    }
    await Promise.allSettled(tasks);
    return map;
  }
}
