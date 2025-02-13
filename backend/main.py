from fastapi import FastAPI, HTTPException
import yt_dlp
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
def get_audio(query: str):

    url = get_youtube_url(query)
    audio_url = get_audio_url(url)
    if not audio_url: raise HTTPException(status_code=404, detail="Valid URL not found")

    return { "url": audio_url }

def get_youtube_url(query: str):
    ydl_opts = {
        'quiet': True,
        'extract_flat': True,
        'skip_download': True
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        result = ydl.extract_info(f"ytsearch:{query}", download=False)
        
        if 'entries' in result and result['entries']:
            return result["entries"][0]["url"]
        else:
            return None
    
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