import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { getAllEvents, type EventData } from "../../services/events.service";
import { Icons } from "../../constants/icon.constants";
import { getAllUsers } from "../../services/users.service";
import type { UserData } from "../../providers/UserContext";
import UserListRow from "../calendar/UserListRow";

function SearchBox() {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchDone, setSearchDone] = useState<boolean>(false);
    const [searchResultsUsers, setSearchResultsUsers] = useState<UserData[]>([]);
    const [searchResultsEvents, setSearchResultsEvents] = useState<EventData[]>([]);

    const [userSearch, setUserSearch] = useState<boolean>(false);
    const [eventSearch, setEventSearch] = useState<boolean>(true);

    const [searchFocused, setSearchFocused] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (!searchQuery) {
            setSearchResultsUsers([]);
            setSearchResultsEvents([]);
            setSearchDone(true);
            return;
        }

        setSearchResultsUsers([]);
        setSearchResultsEvents([]);
        setSearchDone(false);

        const fetchData = setTimeout(async () => {
            if (userSearch) {
                const users = await getAllUsers();
                const filteredUsers = users.filter(user => {
                    return user.showsInSearch && (
                        user.handle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.phoneNumber === searchQuery ||
                        user.email === searchQuery
                    )
                });
                setSearchResultsUsers(filteredUsers);
            }
            if (eventSearch) {
                const events = await getAllEvents();
                const filteredEvents = events.filter(event => {
                    return event.isPublic && (
                        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        event.location?.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                });
                setSearchResultsEvents(filteredEvents);
            }
            
            setSearchDone(true);
        }, 500);

        return () => clearTimeout(fetchData);
    }, [searchQuery, userSearch, eventSearch]);

    return (
        <div className="relative w-full h-full">
            <input
                ref={inputRef}
                className="input input-accent w-full text-lg h-full pr-10"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 100)}
            />
            {searchQuery && (
                <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-base-200 rounded-full p-1 pr-[0.45rem] pl-[0.45rem] hover:bg-base-300 transition-colors z-20 cursor-pointer"
                    onClick={() => {
                        setSearchQuery('');
                        inputRef.current?.focus();
                    }}
                    aria-label="Clear search"
                >
                    <i className={`${Icons.X} w-5 h-5 text-base-content`}></i>
                </button>
            )}
            <AnimatePresence>
                {(searchQuery || searchFocused) &&
                    <motion.div
                        className="absolute top-[120%] left-0 flex flex-col gap-4 w-120 min-h-20 h-fit max-h-140 rounded-box z-10 bg-base-300/50 backdrop-blur-lg border-2 border-accent/50 drop-shadow-2xl"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="sticky top-0 left-0 flex flex-row gap-4 items-center justify-center w-full p-4 pb-0 z-10">
                            <p className="text-xl text-base-content">Search for:</p>
                            <button
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => {
                                    if (userSearch) setEventSearch(prev => !prev);
                                }} 
                                className={`btn btn-lg btn-secondary ${!eventSearch ? 'btn-outline' : ''}`}
                                tabIndex={-1}
                            >
                                Events
                            </button>
                            <button
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => {
                                    if (eventSearch) setUserSearch(prev => !prev);
                                }} 
                                className={`btn btn-lg btn-secondary ${!userSearch ? 'btn-outline' : ''}`}
                                tabIndex={-1}
                            >
                                Users
                            </button>
                        </div>
                        <div className="flex flex-col gap-4 p-4 pt-0 overflow-y-auto">
                            <AnimatePresence>
                                {searchDone && (
                                    <>
                                        {searchResultsUsers.length > 0 && (
                                            <>
                                                <div className="flex flex-row w-full gap-4">
                                                    <p className="text-lg">Users</p>
                                                    <div className="w-full h-1 self-center rounded-full bg-base-content"></div>
                                                </div>
                                                {searchResultsUsers.map(user => (
                                                    <motion.div
                                                        key={user.uid || user.handle}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <UserListRow handle={user.handle} search={true}/>
                                                    </motion.div>
                                                ))}
                                            </> 
                                        )}
                                        {searchResultsEvents.length > 0 && (
                                            <>
                                                <div className="flex flex-row w-full gap-4">
                                                    <p className="text-lg">Events</p>
                                                    <div className="w-full h-1 self-center rounded-full bg-base-content"></div>
                                                </div>
                                                {searchResultsEvents.map(event => (
                                                    <motion.div
                                                        key={event.id}
                                                        onClick={() => navigate(`/app/event/${event.id}`)}
                                                        className="flex flex-col w-full p-4 rounded-box bg-accent/50 border border-transparent transition-all group cursor-pointer hover:bg-transparent hover:border-accent"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <div className="flex justify-between">
                                                            <h3 className="text-lg font-semibold transition-all text-accent-content group-hover:text-base-content">{event.title}</h3>
                                                        </div>
                                                        <p className="text-base transition-all text-accent-content/80 group-hover:text-base-content/80">
                                                            {new Date(event.start).toLocaleDateString()}
                                                            {' '}
                                                            {new Date(event.start).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                            {' '}-{' '}
                                                            {new Date(event.end).toLocaleDateString()}
                                                            {' '}
                                                            {new Date(event.end).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </p>
                                                        {event.location && <p className="text-base transition-all text-accent-content/80 group-hover:text-base-content/80">
                                                            {event.location}
                                                        </p>}
                                                        <div className="flex justify-end w-full">
                                                            <p className="text-base transition-all text-accent-content group-hover:text-base-content">Created by {event.createdBy}</p>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </> 
                                        )}
                                        {searchResultsUsers.length === 0 && searchResultsEvents.length === 0 && (
                                            <motion.p
                                                className="text-base text-base-content/80 w-full mt-auto mb-auto justify-self-center self-center"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                {`Search for events by their title and description. \n Search for users by their names, phone and email.`}
                                            </motion.p>
                                        )}
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                }
            </AnimatePresence>
        </div>
    );
}

export default SearchBox;
