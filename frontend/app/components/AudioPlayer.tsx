import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { IoPlaySkipBack, IoPlaySkipForward, IoPlay, IoPause } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import Loader from "@/app/components/Loader";
import "./AudioPlayer.css";
import Track from "../types";
import { spotifyApi } from "../spotifyAPI";
import ColorThief from "colorthief";
import { lowerColor } from "../utils";

const STATUS = {
    success: "success",
    loading: "loading",
    error: "error"
};

export default function AudioPlayer({ track }: { track: Track }) {
    const playerRef = useRef<HTMLAudioElement | null>(null);
    
    const [trackHistory, setTrackHistory] = useState<Track[]>([track]);
    const [audioHistory, setAudioHistory] = useState<string[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);


    const [status, setStatus] = useState(STATUS.loading);
    const [nextStatus, setNextStatus] = useState(STATUS.loading);
    const [playStatus, setPlayStatus] = useState(false);
    const [trackProgress, setTrackProgress] = useState(0);
    const [isSliding, setIsSliding] = useState(false);
    const [dominantColor, setDominantColor] = useState("rgb(0, 0, 0)");
    const [maximized, setMaximized] = useState(true);

    const isFirstRender = useRef(true);
    
    const loadAudio = async (song: Track) => {
        try {
            setStatus(STATUS.loading);
            const url = await spotifyApi.getTrackAudio(`${song.name} ${song.artists[0].name}`);
            setAudioHistory(prev => [...prev, url]);
            setStatus(STATUS.success);
            setPlayStatus(true);
        } catch {
            setStatus(STATUS.error);
        }
    };

    const loadNextTrack = async () => {
        setNextStatus(STATUS.loading);
        try {
            const [randomTrack] = await spotifyApi.getRandomArtistTracks(track.artists[0].id);
            setTrackHistory(prev => [...prev, randomTrack]);
            const url = await spotifyApi.getTrackAudio(`${randomTrack.name} ${randomTrack.artists[0].name}`);
            setAudioHistory(prev => [...prev, url]);
            setNextStatus(STATUS.success);
        } catch {
            setNextStatus(STATUS.error);
        }
    };

    const handleNextTrack = () => {
        if (!playerRef.current) return;

        playerRef.current.pause();
        const newIndex = currentTrackIndex + 1;
        setCurrentTrackIndex(newIndex);
        if (newIndex === trackHistory.length - 1) loadNextTrack();
        setTimeout(() => {
            playerRef.current?.load();
            playerRef.current?.play();
        }, 100);
    };

    const handlePrevTrack = () => {
        if (!playerRef.current || currentTrackIndex === 0) return;

        playerRef.current.pause();
        setCurrentTrackIndex(prev => prev - 1);
        setTimeout(() => {
            playerRef.current?.load();
            playerRef.current?.play();
        }, 100);
    }

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        
        loadAudio(track);
        loadNextTrack();
    }, []);


    useEffect(() => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = trackHistory[currentTrackIndex].album.images[0].url;
    
        img.onload = () => {
            const colorThief = new ColorThief();
            const color = colorThief.getColor(img);
            const lowColor = lowerColor(`rgb(${color[0]}, ${color[1]}, ${color[2]})`);
            setDominantColor(lowColor);
        };
    }, [currentTrackIndex]);

    useEffect(() => {
        if (!playerRef.current) return;
        playStatus ? playerRef.current.play() : playerRef.current.pause();
    }, [playStatus]);

    const togglePlayPause = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setPlayStatus((prev) => !prev);
    };

    const handleTrackProgress = () => {
        if (!playerRef.current || isSliding) return;
        const { currentTime, duration } = playerRef.current;
        if (!isNaN(duration) && duration > 0) {
            setTrackProgress((currentTime / duration) * 100);
        }
    };

    useEffect(() => {
        if (!playStatus) return;
        const interval = setInterval(handleTrackProgress, 1000);
        return () => clearInterval(interval);
    }, [playStatus]);

    const handleSliderCommit = (value: number) => {
        setIsSliding(false);
        if (!playerRef.current) return;
        const { duration } = playerRef.current;
        if (!isNaN(duration)) {
            playerRef.current.currentTime = (value / 100) * duration;
        }
    };

    const handleClick = () => {
        if (maximized) return;

        setMaximized(true);
    }

    const bg = maximized ? `linear-gradient(180deg, ${dominantColor}, #000)` : dominantColor;

    return (
        <main onClick={handleClick} style={{ background: bg }} className={`AudioPlayer ${maximized ? "max" : "small"}`}>
            {maximized && (
                <button onClick={() => setMaximized(false)} className="toggleOpenBtn">
                    <IoIosArrowDown size={30} />
                </button>
            )}

            <img src={trackHistory[currentTrackIndex].album.images[0].url} alt={trackHistory[currentTrackIndex].name} />
            <div className="flex flex-col w-full overflow-hidden">
                <h4 className="text-xl truncate w-full text-ellipsis">{trackHistory[currentTrackIndex].name}</h4>
                <small className="truncate text-ellipsis text-neutral-300">{trackHistory[currentTrackIndex].artists.map(a => a.name).join(", ")}</small>
            </div>
            <audio ref={playerRef} onEnded={() => handleNextTrack()} src={audioHistory[currentTrackIndex]}></audio>

            <section className="controller" style={{ background: "linear-gradient(0deg, #09090B, #0000)" }}>
                <Slider
                    onValueChange={(value) => {
                        setIsSliding(true);
                        setTrackProgress(value[0]);
                    }}
                    onValueCommit={(value) => handleSliderCommit(value[0])}
                    value={[trackProgress]}
                    className="w-full"
                />

                <div className="buttons">
                    <Button 
                        onClick={() => handlePrevTrack()}
                        className="text-white rounded-full"
                        variant="ghost"
                        disabled={currentTrackIndex === 0}
                    >
                        <IoPlaySkipBack />
                    </Button>

                    <button
                        onClick={togglePlayPause}
                        className="h-full aspect-square rounded-full text-black bg-white flex justify-center items-center active:bg-gray-300"
                        disabled={status === STATUS.error}
                    >
                        {status === STATUS.loading ? <Loader /> : playStatus ? <IoPause size={35} /> : <IoPlay size={35} />}
                    </button>

                    <Button
                        onClick={()=> handleNextTrack()} 
                        className="text-white rounded-full"
                        variant="ghost"
                        disabled={nextStatus !== STATUS.success}
                    >
                        <IoPlaySkipForward />
                    </Button>
                </div>
            </section>
        </main>
    );
}
