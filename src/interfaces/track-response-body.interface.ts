export default interface TrackResponseBody {
  name: string;
  artists: {
    name: string;
  }[];
  album: {
    name: string;
    images: {
      url: string;
    }[];
  };
  explicit: boolean;
  external_urls: {
    spotify: string;
  };
}
