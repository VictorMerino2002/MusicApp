from fastapi import FastAPI, HTTPException
import yt_dlp
import requests
import urllib.parse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/audio")
def get_audio(track_name: str):

    videoId = get_youtube_video_id(track_name)
    url = f"https://www.youtube.com/watch?v={videoId}"
    audio_url = get_audio_url(url)
    if not audio_url: raise HTTPException(status_code=404, detail="Valid URL not found")

    return { "url": audio_url }

def get_youtube_video_id(name: str):
    api_key = "AIzaSyB4MdsSLA16hPK7So9dx5QEYnMqK4FORdU"
    base_url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": name,
        "key": api_key,
        "type": "video",
        "maxResults": 1
    }
    response = requests.get(base_url, params=params, timeout=10)
    response.raise_for_status()
    data = response.json()
    
    if not data.get("items"): return
            
    return data["items"][0]["id"]["videoId"]
    


def get_audio_url(url):
    ydl_options = {
        "format": "bestaudio/best",
        "quiet": True,
        "skip_download": True
    }

    audio_url = None
    try:
        with yt_dlp.YoutubeDL(ydl_options) as downloader:
            info_dict = downloader.extract_info(url, download=False)

            formats = info_dict.get("formats", [info_dict])

            for f in formats:
                if f.get("acodec") != "none" and f.get("url") and "acodec" in f:
                    audio_url = f.get("url")
                    return audio_url
    except Exception as error:
        print(error)
        return None

    return audio_url