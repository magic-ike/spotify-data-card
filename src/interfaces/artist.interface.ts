export default interface Artist {
  name: string;
  images: {
    url: string;
  }[];
  external_urls: {
    spotify: string;
  };
}
