import Artist from './artist.interface';

export default interface Track {
  title: string;
  artist: string;
  albumTitle: string;
  albumImageUrl: string;
  explicit: boolean;
  url: string;
}

// distinguishes between a track item and an artist item
export const isTrack = (item: Track | Artist): item is Track => {
  // artists can never have an `artist` property because they themselves are the artist
  return (item as Track).artist !== undefined;
};
