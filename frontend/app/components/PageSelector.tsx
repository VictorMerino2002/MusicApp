import { IoHome } from "react-icons/io5";
import { RiPlayListFill } from "react-icons/ri";
import { IoIosSearch } from "react-icons/io";
import AudioPlayer from "./AudioPlayer";
import { useState } from "react";
import Track from "../types";
import SearchPage from "../pages/Search";
import HomePage from "../pages/Home";

export function PageSelector() {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [currentPage, setCurrentPage] = useState<"home" | "search" | "playlist">("home");
    const pages = {
        home: <HomePage/>,
        search: <SearchPage setCurrentTrack={setCurrentTrack}/>,
        playlist: <SearchPage setCurrentTrack={setCurrentTrack}/>
    }

    const iconColor = "text-emerald-500";
    const btnClassName = "w-full h-full flex justify-center items-center";

    return (
        <>
        {pages[currentPage]}        
        {currentTrack && <AudioPlayer key={currentTrack.id} track={currentTrack} />}

        <nav className="h-20 w-full fixed bottom-0 z-50 flex justify-around items-center bg-zinc-950">
            <button className={btnClassName} onClick={() => setCurrentPage("home")}>
                <IoHome 
                    className={currentPage === "home" ? iconColor  : ""}
                    size={30}
                />
            </button>
            
            <button className={btnClassName} onClick={() => setCurrentPage("search")}>
                <IoIosSearch 
                    className={currentPage === "search" ? iconColor : ""}
                    size={30} 
                />
            </button>

            <button className={btnClassName} onClick={() => setCurrentPage("playlist")}>
                <RiPlayListFill 
                    className={currentPage === "playlist" ? iconColor : ""}
                    size={30}
                />
            </button>
        </nav>
        </>
    );
}