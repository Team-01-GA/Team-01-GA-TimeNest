import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedOutlet from "../../components/AnimatedOutlet";
import { NewUserContext } from "../../providers/NewUserContext";
import AnimatedPage from "../../components/AnimatedPage";
import ThemeSwitcher from "../../components/ThemeSwitcher/ThemeSwitcher";
import { AnimatePresence, motion } from "framer-motion";
import { getAllEvents, type EventData } from "../../services/events.service";

function HomePage() {
    const [isNew, setIsNew] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchDone, setSearchDone] = useState<boolean>(false);
    const [searchMessage, setSearchMessage] = useState<string>('');
    const [searchResults, setSearchResults] = useState<EventData[]>([]);
    const [inputFocused, setInputFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (!searchQuery) {
            setSearchResults([]);
            setSearchDone(true);
            setSearchMessage('No events found.');
            return;
        }
        setSearchDone(false);
        setSearchMessage('');
        const fetchEvents = setTimeout(async () => {
            const events = await getAllEvents();
            const filteredEvents = events.filter(event => {
                return event.isPublic && (event.title.includes(searchQuery) || event.description?.includes(searchQuery));
            });
            setSearchResults(filteredEvents);
            setSearchDone(true);
            setSearchMessage('No events found.');
        }, 500);

        return () => clearTimeout(fetchEvents);
    }, [searchQuery]);

    const toggleAuth = (isNewFlag: boolean) => {
        setIsNew(isNewFlag);
        navigate('/welcome/auth');
    }

    return (
        <>
            <ThemeSwitcher home={true}/>
            <AnimatedPage>
                <div className="flex flex-col items-center justify-center gap-8 w-full h-full">
                    <div className="flex flex-col">
                        <p className="text-center text-2xl">Your schedule's smartest upgrade</p>
                        <h1 className="text-9xl font-bold">TimeNest</h1>
                    </div>
                    <div className="flex flex-row gap-4 w-full items-center justify-center h-16">
                        <div className="relative h-full w-[20%]">
                            <input
                                ref={inputRef}
                                className="relative input input-accent h-full w-full text-xl z-20"
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for public events..."
                                onFocus={() => setInputFocused(true)}
                                onBlur={() => setTimeout(() => setInputFocused(false), 100)}
                            />
                            <AnimatePresence>
                                {searchQuery && inputFocused &&
                                    <motion.div
                                        className="absolute top-[120%] left-0 flex flex-col gap-4 p-4 w-full max-w-full min-h-20 h-fit max-h-90 overflow-y-auto rounded-box z-10 bg-base-300/50 backdrop-blur-lg border-2 border-base-100 drop-shadow-2xl"
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <AnimatePresence>
                                            {searchDone && searchResults.length > 0
                                                ? searchResults.map(event => (
                                                    <motion.div 
                                                        key={event.id} 
                                                        onClick={() => navigate(`/welcome/event/${event.id}`)}
                                                        className="flex flex-col w-full p-4 rounded-box bg-accent/50 border border-transparent transition-all group cursor-pointer hover:bg-transparent hover:border-accent"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <div className="flex justify-between">
                                                            <h3 className="text-xl font-semibold transition-all text-accent-content group-hover:text-base-content">{event.title}</h3>
                                                        </div>
                                                        <p className="text-lg transition-all text-accent-content group-hover:text-base-content">
                                                            {new Date(event.start).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                            {' '}-{' '}
                                                            {new Date(event.end).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                            {event.location && `, ${event.location}`}
                                                        </p>
                                                        <div className="flex justify-between mt-1">
                                                            <p className="text-lg transition-all text-accent-content group-hover:text-base-content">Created by {event.createdBy}</p>
                                                        </div>
                                                    </motion.div>
                                                ))
                                                : <motion.p 
                                                    className="text-xl w-full text-center mt-auto mb-auto justify-self-center self-center"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    {searchMessage}
                                                </motion.p>
                                            }
                                        </AnimatePresence>
                                    </motion.div>
                                }
                            </AnimatePresence>
                        </div>
                        <h2 className="text-xl">or</h2>
                        <button onClick={() => toggleAuth(true)} className="btn btn-primary btn-lg h-full w-[20%]">Sign up for a free account</button>
                    </div>
                    <div className="flex flex-row gap-4 w-full items-center justify-center">
                        <p className="text-xl">Already a member?</p>
                        <button onClick={() => toggleAuth(false)} className="btn btn-accent btn-outline btn-lg">Sign in</button>
                    </div>
                    <NewUserContext.Provider value={{ isNew }}>
                        <AnimatedOutlet />
                    </NewUserContext.Provider>
                </div>
            </AnimatedPage>
        </>
    )
}

export default HomePage;
