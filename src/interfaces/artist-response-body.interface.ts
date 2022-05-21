export default interface ArtistResponseBody {
  name: string;
  images: {
    url: string;
  }[];
  external_urls: {
    spotify: string;
  };
}
