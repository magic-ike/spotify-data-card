export default interface Track {
  name: string;
  artists: {
    name: string;
  }[];
  album: {
    images: {
      url: string;
    }[];
  };
  external_urls: {
    spotify: string;
  };
}
