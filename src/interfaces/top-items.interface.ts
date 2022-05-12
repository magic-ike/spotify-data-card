import Track from './track.interface';
import Artist from './artist.interface';

export default interface TopItems {
  items: (Track | Artist)[];
}
