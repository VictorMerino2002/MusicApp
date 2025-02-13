import Track from "../types";

export default function TrackThumbnail({ track, handleClick }: { track: Track, handleClick: any }) {
    return (
        <div onClick={handleClick} className="flex gap-6 items-center">
            <img className="w-14 aspect-square object-cover" src={track.album.images[0].url} alt={track.name} />
            <div className="w-full overflow-hidden">
                <h3 className="truncate text-lg">{track.name}</h3>
                <small className="text-zinc-400">Song - {track.artists[0].name}</small>
            </div>
      </div>
    );
}