import axios from 'axios';
import { readFileSync } from 'fs';

export const getBase64DataFromImageUrl = async (
  url: string
): Promise<string> => {
  let image;
  try {
    image = await axios.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer'
    });
  } catch (error) {
    console.log(error);
    return '';
  }
  return Buffer.from(image.data).toString('base64');
};

export const getBase64DataFromImagePath = (path: string) => {
  return readFileSync(path, { encoding: 'base64' });
};
