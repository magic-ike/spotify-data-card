import Track from './track.interface';
import Artist from './artist.interface';

export type Item = Track | Artist | null;

// distinguishes between a track item and an artist item
export const isTrack = (item: Item): item is Track => {
  // artists can never have an `artist` property because they themselves are the artist
  return (item as Track)?.artist !== undefined;
};
