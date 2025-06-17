import { useContext, useEffect, useRef, useState } from "react";
import Modal from "../Modal/Modal";
import { getAllUsers } from "../../services/users.service";
import { deleteEvent, getAllEvents, type EventData } from "../../services/events.service";
import type { UserData } from "../../providers/UserContext";
import { useNavigate } from "react-router-dom";
import AdminUserList from "./AdminUserList";
import UserContext from "../../providers/UserContext";
import AlertContext from "../../providers/AlertContext";
import { AlertTypes } from "../../constants/alert.constants";
import Dropdown from "../Dropdown/Dropdown";
import { DropdownTypes } from "../../constants/dropdown.constants";
import DropdownContext from "../../providers/DropdownContext";

const EVENTS_PER_PAGE = 5;

function AdminPanel() {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchDone, setSearchDone] = useState<boolean>(false);
    const [searchResultsUsers, setSearchResultsUsers] = useState<UserData[]>([]);
    const [searchResultsEvents, setSearchResultsEvents] = useState<EventData[]>([]);
    const [userSearch, setUserSearch] = useState<boolean>(true);
    const [eventSearch, setEventSearch] = useState<boolean>(true);
    const [eventPage, setEventPage] = useState(1);

    const { userData } = useContext(UserContext);
    const { showAlert } = useContext(AlertContext);
    const { openDropdown } = useContext(DropdownContext);

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
                    return (
                        user.handle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.phoneNumber === searchQuery ||
                        user.email === searchQuery
                    );
                });
                setSearchResultsUsers(filteredUsers);
            }
            if (eventSearch) {
                const events = await getAllEvents();
                const filteredEvents = events.filter(event => {
                    return (
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

    const handleDelete = async (event: EventData) => {
            try {
                await deleteEvent(event.id!, event.createdBy);
                showAlert(AlertTypes.INFO, "Event deleted successfully.");
            } catch (err) {
                console.error("Failed to delete event", err);
                showAlert(AlertTypes.ERROR, "Failed to delete event.");
            }
    };

    const paginatedEvents = searchResultsEvents.slice(
        (eventPage - 1) * EVENTS_PER_PAGE,
        eventPage * EVENTS_PER_PAGE
    );

    return (
        <Modal title="Admin Panel" width="1000px">
            <div className="flex flex-col w-full gap-4 pt-2">
                <div className="sticky top-0 z-[2] flex flex-row justify-center items-center gap-4 w-full bg-base-100/60 backdrop-blur-[3px] pt-1 pb-4">
                    <input
                        ref={inputRef}
                        className="input input-xl w-full"
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <p className="text-xl">Include:</p>
                    <button
                        className={`btn btn-secondary btn-lg ${userSearch ? "" : "btn-outline"}`}
                        onClick={() => {
                            if (eventSearch) setUserSearch(prev => !prev)
                        }}
                        type="button"
                    >
                        Users
                    </button>
                    <button
                        className={`btn btn-secondary btn-lg ${eventSearch ? "" : "btn-outline"}`}
                        onClick={() => {
                            if (userSearch) setEventSearch(prev => !prev)
                        }}
                        type="button"
                    >
                        Events
                    </button>
                </div>
                <div className="flex flex-col p-4 gap-4 bg-base-300 rounded-box min-h-40">
                    {searchDone && (
                        <>
                            {userSearch && searchResultsUsers.length > 0 && (
                                <>
                                    <div className="flex flex-row w-full gap-4">
                                        <p className="text-lg font-bold">Users</p>
                                        <div className="w-full h-1 self-center rounded-full bg-base-content"></div>
                                    </div>
                                    {searchResultsUsers.map(user => {
                                        if (userData?.handle !== user.handle) {
                                            return (
                                                <div key={user.uid || user.handle}>
                                                    <AdminUserList handle={user.handle} />
                                                </div>
                                            );
                                        }
                                    })}
                                </>
                            )}
                            {eventSearch && searchResultsEvents.length > 0 && (
                                <>
                                    <div className="flex flex-row w-full gap-4">
                                        <p className="text-lg font-bold self-center">Events</p>
                                        <div className="flex-1 h-1 self-center rounded-full bg-base-content"></div>
                                        <div className="flex gap-4 justify-center w-fit">
                                            <button
                                                className="btn btn-md"
                                                disabled={eventPage === 1}
                                                onClick={() => setEventPage(p => p - 1)}
                                            >
                                                Prev
                                            </button>
                                            <p className="text-lg self-center">Page {eventPage} of {Math.ceil(searchResultsEvents.length / EVENTS_PER_PAGE)}</p>
                                            <button
                                                className="btn btn-md"
                                                disabled={eventPage === Math.ceil(searchResultsEvents.length / EVENTS_PER_PAGE)}
                                                onClick={() => setEventPage(p => p + 1)}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                    {paginatedEvents.map(event => (
                                        <div
                                            key={event.id}
                                            onClick={() => navigate(`/app/event/${event.id}`)}
                                            className="flex flex-col w-full p-4 rounded-box bg-neutral border border-transparent transition-all group cursor-pointer hover:bg-transparent hover:border-neutral"
                                        >
                                            <div className="flex flex-col h-full justify-between">
                                                <h3 className="text-xl font-bold transition-all text-neutral-content group-hover:text-base-content">{event.title}</h3>
                                                <p className="text-lg transition-all text-neutral-content group-hover:text-base-content">
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
                                                    {event.location && `, ${event.location}`}
                                                </p>
                                                <p className="text-lg transition-all text-neutral-content group-hover:text-base-content">Created by {event.createdBy}</p>
                                            </div>
                                            <div className="flex flex-row gap-4 mt-2 justify-between">
                                                <div className="flex gap-4">
                                                    {event.isMultiDay && <div className="badge badge-xl transition-all group-hover:badge-neutral">Multi-day</div>}
                                                    {event.recurrence && event.recurrence.length > 0 
                                                        ? <div className="badge badge-xl transition-all group-hover:badge-neutral">{event.recurrence.includes('Monthly') ? 'Monthly' : 'Weekly'}</div>
                                                        : !event.isMultiDay && <div className="badge badge-xl transition-all group-hover:badge-neutral">Single day</div>
                                                    }
                                                    <div className="badge badge-xl transition-all group-hover:badge-neutral">Participants: {event.participants?.length ?? 0}</div>
                                                </div>
                                                <div onClick={(e) => e.stopPropagation()} className="flex gap-4">
                                                    <button onClick={() => navigate(`/app/event/edit/${event.id}`)} className="badge badge-xl bg-transparent text-base-300 outline outline-base-300 transition-all group-hover:bg-neutral group-hover:text-neutral-content cursor-pointer">Edit</button>
                                                    <button onClick={(e) => openDropdown(DropdownTypes.ADMIN_DELETE_EVENT, e)} className="badge badge-xl bg-transparent text-base-300 border-none outline outline-error transition-all group-hover:bg-error group-hover:text-error-content cursor-pointer">Delete</button>
                                                    <Dropdown title="Delete event?" keyToOpen={DropdownTypes.ADMIN_DELETE_EVENT} clickCloses={true}>
                                                        <div className="w-full flex flex-col gap-2 drop-shadow-none">
                                                            <button onClick={() => handleDelete(event)} className="btn btn-lg btn-error drop-shadow-none">Confirm</button>
                                                            <button className="btn btn-lg btn-neutral drop-shadow-none">Cancel</button>
                                                        </div>
                                                    </Dropdown>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                            {!searchResultsUsers.length && !searchResultsEvents.length && (
                                <>
                                    {searchQuery
                                        ? <p className="text-2xl text-base-content/70 text-center mt-auto mb-auto w-[90%] self-center">
                                            No results found.
                                        </p>
                                        : <p className="text-lg text-base-content/70 mt-auto mb-auto w-[90%] self-center">
                                            <strong>Admin Panel</strong> allows you to search for <strong>users</strong> using any of their data, and block / pardon them. <br /> Blocked users <strong>will not</strong> be able to access TimeNest at all. <br />You can also search for <strong>events</strong> by any of their data, and delete / edit them.
                                        </p>
                                    }
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
}

export default AdminPanel;