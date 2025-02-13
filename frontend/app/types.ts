export default interface Track {
    id: string;
    name: string;
    artists: { id: string, name: string }[];
    album: {
      images: { url: string }[];
      name: string;
    };
    external_urls: { spotify: string };
    preview_url: string | null;
  }