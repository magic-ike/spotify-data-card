import TrackResponseBody from './track-response-body.interface';
import ArtistResponseBody from './artist-response-body.interface';

export default interface TopItemsResponseBody {
  items: (TrackResponseBody | ArtistResponseBody)[];
}
