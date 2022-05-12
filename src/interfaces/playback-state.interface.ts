import Track from './track.interface';

export default interface PlaybackState {
  is_playing: boolean;
  item: Track;
}
