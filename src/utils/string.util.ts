export const generateRandomString = (length: number) => {
  let result = '';
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const boolFromString = (str?: string) => {
  const lowerCaseString = str?.toLowerCase();
  return lowerCaseString === 'true' || lowerCaseString === '1';
};

export const boundedIntFromString = (
  min: number,
  max: number,
  defaultVal: number,
  str?: string
) => {
  return Math.min(max, Math.max(min, intFromString(defaultVal, str)));
};

export const intFromString = (defaultVal: number, str?: string) => {
  if (!str) return defaultVal;
  const num = parseInt(str, 10);
  if (isNaN(num)) return defaultVal;
  return num;
};
