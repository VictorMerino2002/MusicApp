const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;

export class SpotifyAPI {

    constructor() {
        this.token = "";
    }

    async setToken() {
        const url = "https://accounts.spotify.com/api/token";
        const headers = {
            'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`),
            "Content-Type": "application/x-www-form-urlencoded"
        }

        const res = await fetch(url, {
            method: "POST",
            headers,
            body: "grant_type=client_credentials"
        });

        const json = await res.json();

        this.token = json.access_token;
    }

    async getTracksByName(name: string) {
        if(!this.token) await this.setToken();
        
        const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(name)}&type=track`;

        const res = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        });

        const json = await res.json();

        const tracks = json.tracks.items;
        const next = json.tracks.next;

        return { tracks, next }
    }

    async getTrackAudio(query: string) {
        const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
        const res = await fetch(`${backend}/audio?query=${query}`);
        const { url } = await res.json();
  
        return url;
    }

    async getArtistTopTracks(artistId: string) {
        if(!this.token) await this.setToken();

        const url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks`;

        const res = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        })

        const json = await res.json();

        return json;
    }

    async getArtistAlbums(artistId: string) {
        if (!this.token) await this.setToken();

        const url = `https://api.spotify.com/v1/artists/${artistId}/albums?limit=50&include_groups=album,single`;

        const res = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        });

        const json = await res.json();

        return json.items;
    }

    async getAlbumTracks(albumId: string) {
        if (!this.token) await this.setToken();

        const url = `https://api.spotify.com/v1/albums/${albumId}/tracks`;

        const res = await fetch(url,{
            method: "GET",
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        });

        const json = await res.json();

        return json.items;
    }

    async getArtistTracks(artistId: string, limit: number = 50) {
        const albums = await this.getArtistAlbums(artistId);
        const tracks = [];
    
        let index = 0;
        while (tracks.length < limit && index < albums.length) {
            const album = albums[index];
            const albumTracks = await this.getAlbumTracks(album.id);
            
            const remaining: number = limit - tracks.length;
            
            tracks.push(...albumTracks.slice(0, remaining));
            index++;
        }
    
        return tracks;
    }

    async getRandomArtistTracks(artistId: string, limit: number = 5) {
        const albums = await this.getArtistAlbums(artistId);
        const randomAlbums = albums.sort(() => Math.random() - 0.5);
        const tracks = [];
    
        let index = 0;
        while (tracks.length < limit && index < randomAlbums.length) {
            const album = albums[index];
            const albumTracks = await this.getAlbumTracks(album.id);
            albumTracks.forEach(track => track.album = { images: album.images });

            const remaining: number = limit - tracks.length;

            tracks.push(...albumTracks.slice(0, remaining));
            index++;
        }
    
        return tracks;
    }
}