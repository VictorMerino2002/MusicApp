"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormEvent, useState } from "react";
import TrackThumbnail from "../components/TrackThumbnail";
import { IoIosSearch } from "react-icons/io";
import { spotifyApi } from "../spotifyAPI";
import Track from "../types";

interface SearchPageProps {
    setCurrentTrack: (track: Track) => void;
}

export default function SearchPage({ setCurrentTrack }: SearchPageProps) {
    const [trackList, setTrackList] = useState<Track[] | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const input = form.elements[0] as HTMLInputElement;

    if (!input.value.trim()) return;

    try {
        const { tracks } = await spotifyApi.getTracksByName(input.value);
        setTrackList(tracks);
    } catch (error) {
        console.error("Error fetching tracks:", error);
    }
    };
    return (
        <main className="flex flex-col gap-6 p-6">
            <form onSubmit={handleSubmit} className="flex gap-3">
                <Input type="text" placeholder="Search for a song..." />
                <Button type="submit">
                <IoIosSearch />
                </Button>
            </form>

            <div className="flex flex-col gap-4">
                {trackList?.map(track => (
                <TrackThumbnail 
                    key={track.id} 
                    track={track} 
                    handleClick={() => setCurrentTrack(track)} 
                />
                ))}
        </div>
        </main>
    );
}