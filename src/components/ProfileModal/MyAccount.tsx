import { useContext, useEffect, useState, type CSSProperties } from "react";
import UserContext, { type UserData } from "../../providers/UserContext";
import { type EventData } from "../../services/events.service";
import AnimatedPage from "../AnimatedPage";
import { useNavigate } from "react-router-dom";
import { getUserByHandle, updateUserProfileFields } from "../../services/users.service";
import AlertContext from "../../providers/AlertContext";
import { AlertTypes } from "../../constants/alert.constants";

type MyAccountProps = {
    userObject?: UserData | null;
    events: EventData[];
}

function MyAccountDetails({ events }: MyAccountProps) {

    const { userData } = useContext(UserContext);
    const { showAlert } = useContext(AlertContext);
    const [accDetails, setAccDetails] = useState<number>(1);
    const [userDate, setUserDate] = useState<string>('');

    const [editing, setEditing] = useState({
        bio: false,
        name: false,
        phone: false,
    });

    const [bioInput, setBioInput] = useState(userData?.bio ?? "");
    const [firstNameInput, setFirstNameInput] = useState(userData?.firstName ?? "");
    const [lastNameInput, setLastNameInput] = useState(userData?.lastName ?? "");
    const [phoneInput, setPhoneInput] = useState(userData?.phoneNumber ?? "");

    const [newEventsPublic, setNewEventsPublic] = useState<boolean | null>(null);
    const [openInvites, setOpenInvites] = useState<boolean | null>(null);
    const [showsInSearch, setShowsInSearch] = useState<boolean | null>(null);
    const [sharesContacts, setSharesContacts] = useState<boolean | null>(null);

    const [eventPage, setEventPage] = useState(1);
    const EVENTS_PER_PAGE = 5;

    const navigate = useNavigate();

    const paginatedEvents = events.slice(
        (eventPage - 1) * EVENTS_PER_PAGE,
        eventPage * EVENTS_PER_PAGE
    );

    useEffect(() => {
        if (userData) {
            const getUserDetails = async () => {
                const userObject = await getUserByHandle(userData.handle) as UserData;

                setBioInput(userObject.bio ?? "");
                setFirstNameInput(userObject.firstName ?? "");
                setLastNameInput(userObject.lastName ?? "");
                setPhoneInput(userObject.phoneNumber ?? "");
                setUserDate(new Date(+userObject.createdOn).toLocaleDateString());
                setNewEventsPublic(userObject.newEventsPublic);
                setOpenInvites(userObject.openInvites);
            }

            getUserDetails();
        }
    }, [userData]);

    useEffect(() => {
        setEventPage(1); // Reset page if events change
    }, [events]);

    const higlighterStyles: CSSProperties = {
        left: accDetails === 1
            ? '0'
            : accDetails === 2
                ? '50%'
                : '100%',
        transform: accDetails === 1
            ? 'translateX(0)'
            : accDetails === 2
                ? 'translateX(-50%)'
                : 'translateX(-100%)',
        width: '6rem',
        transition: 'all 0.3s ease'
    };

    const handleSaveBio = async () => {
        if (!userData) return;
        await updateUserProfileFields(userData.handle, { bio: bioInput });
        setEditing(prev => ({ ...prev, bio: false }));
    };

    const handleSaveName = async () => {
        if (!userData) return;
        await updateUserProfileFields(userData.handle, { firstName: firstNameInput, lastName: lastNameInput });
        setEditing(prev => ({ ...prev, name: false }));
    };

    const handleSavePhone = async () => {
        if (!userData) return;
        await updateUserProfileFields(userData.handle, { phoneNumber: phoneInput });
        setEditing(prev => ({ ...prev, phone: false }));
    };

    const handleSaveNewEventsPublic = async (state: boolean) => {
        if (!userData) return;
        if (state && !newEventsPublic || !state && newEventsPublic) {
            await updateUserProfileFields(userData.handle, { newEventsPublic: state });
            setNewEventsPublic(state);
            showAlert(AlertTypes.INFO, `New events will be set to ${state ? 'public' : 'private'} from now on.`);
        }
    }

    const handleSaveOpenInvites = async (state: boolean) => {
        if (!userData) return;
        if (state && !openInvites || !state && openInvites) {
            await updateUserProfileFields(userData.handle, { openInvites: state });
            setOpenInvites(state);
            if (state) {
                showAlert(AlertTypes.INFO, 'Others can now invite you to their events.');
            } else {
                showAlert(AlertTypes.INFO, 'You can no longer be added to events by other people.');
            }
        }
    }

    const handleSaveShowsInSearch = async (state: boolean) => {
        if (!userData) return;
        if (state && !showsInSearch || !state && showsInSearch) {
            await updateUserProfileFields(userData.handle, { showsInSearch: state });
            setShowsInSearch(state);
            if (state) {
                showAlert(AlertTypes.INFO, 'Others can now look you up by your names, phone and email.');
            } else {
                showAlert(AlertTypes.INFO, 'You will no longer be showed in search results.');
            }
        }
    }

    const handleSaveShareContacts = async (state: boolean) => {
        if (!userData) return;
        if (state && !sharesContacts || !state && sharesContacts) {
            await updateUserProfileFields(userData.handle, { sharesContacts: state });
            setSharesContacts(state);
            if (state) {
                showAlert(AlertTypes.INFO, 'Others can now see your contacts.');
            } else {
                showAlert(AlertTypes.INFO, 'Your contacts are now hidden.');
            }
        }
    }

    return (
        <>

            <div className="sticky top-0 z-[2] flex flex-row justify-center items-center w-[103%] bg-base-100/60 backdrop-blur-[3px] pt-0 pb-4">
                <div className="flex flex-row w-fit justify-center relative gap-4">
                    <button className="bg-secondary rounded-box text-2xl absolute top-1/2 transform translate-y-[-50%] p-1 m-0 text-transparent z-0 pointer-events-none whitespace-nowrap" style={higlighterStyles} disabled>
                        {accDetails === 1 && 'Events'}
                        {accDetails === 2 && 'Details'}
                        {accDetails === 3 && 'Settings'}
                    </button>
                    <button onClick={() => setAccDetails(1)} className="btn w-24 p-0 m-0 z-10 bg-transparent border-none text-xl text-base-content cursor-pointer whitespace-nowrap">Events</button>
                    <button onClick={() => setAccDetails(2)} className="btn w-24 p-0 m-0 z-10 bg-transparent border-none text-xl text-base-content cursor-pointer whitespace-nowrap">Details</button>
                    <button onClick={() => setAccDetails(3)} className="btn w-24 p-0 m-0 z-10 bg-transparent border-none text-xl text-base-content cursor-pointer whitespace-nowrap">Settings</button>
                </div>
            </div>
            <div className="w-full p-4 bg-base-200 rounded-box overflow-x-hidden">
                {accDetails === 1 &&
                    <AnimatedPage direction="left">
                        <div className="flex flex-col gap-4 w-full">
                            {events.length > 0
                                ? <>
                                    <div className="flex flex-row justify-between items-center mb-2">
                                        <div />
                                        <div className="flex gap-4 items-center">
                                            <button
                                                className="btn btn-md"
                                                disabled={eventPage === 1}
                                                onClick={() => setEventPage(p => p - 1)}
                                            >
                                                Prev
                                            </button>
                                            <p className="text-lg self-center">
                                                Page {eventPage} of {Math.ceil(events.length / EVENTS_PER_PAGE)}
                                            </p>
                                            <button
                                                className="btn btn-md"
                                                disabled={eventPage === Math.ceil(events.length / EVENTS_PER_PAGE)}
                                                onClick={() => setEventPage(p => p + 1)}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                    {paginatedEvents.map((event) => (
                                        <div onClick={() => navigate(`/app/event/${event.id}`)} key={event.id} className="flex flex-row gap-4 bg-primary w-full h-fit p-4 rounded-box cursor-pointer">
                                            <div className="w-2 min-h-full justify-self-stretch bg-primary-content rounded-box"></div>
                                            <div className="relative flex flex-col gap-2 w-full p-2">
                                                <p className="text-xl text-primary-content font-bold">{event.title}</p>
                                                <p className="text-lg text-primary-content/80">
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
                                                <p className="text-lg text-primary-content/80">{event?.location}</p>
                                                {event.createdBy !== userData?.handle && 
                                                    <p onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/app/account/${event.createdBy}`)
                                                    }} className="absolute bottom-0 right-0 text-md text-primary-content/80 p-2 rounded-box transition-all hover:bg-neutral hover:text-neutral-content">
                                                        Created by {event.createdBy}
                                                    </p>
                                                }
                                            </div>
                                        </div>
                                    ))}
                                </>
                                : <>
                                    <p className="text-2xl w-[70%] self-center text-center text-base-content">You currently don't participate in any events.</p>
                                    <button onClick={() => navigate('/app/event/create')} className="btn btn-neutral btn-lg w-fit self-center">Create Event</button>
                                </>
                            }
                        </div>
                    </AnimatedPage>
                }
                {accDetails === 2 &&
                    <AnimatedPage direction="left">
                        <div className="grid grid-cols-[50%_50%] grid-rows-4 gap-4 h-fit w-[97%]">
                            {/* Bio */}
                            <div className="col-start-1 row-span-4 bg-primary p-4 rounded-box">
                                <div className="flex flex-row justify-between gap-4 w-full">
                                    <p className="text-xl font-bold text-primary-content">Bio</p>
                                    {editing.bio
                                        ? null
                                        : <p onClick={() => setEditing(prev => ({ ...prev, bio: true }))} className="text-lg text-primary-content/80 cursor-pointer">Edit</p>
                                    }
                                </div>
                                {editing.bio
                                    ? <>
                                        <textarea
                                            className="textarea textarea-secondary w-full"
                                            value={bioInput}
                                            onChange={e => setBioInput(e.target.value)}
                                            rows={4}
                                        />
                                        <div className="flex gap-2 w-full mt-2">
                                            <button className="btn btn-success btn-sm flex-1" onClick={handleSaveBio}>Save</button>
                                            <button className="btn btn-neutral btn-sm flex-1" onClick={() => {
                                                setBioInput(userData?.bio ?? "");
                                                setEditing(prev => ({ ...prev, bio: false }));
                                            }}>Cancel</button>
                                        </div>
                                    </>
                                    : <p className="text-l text-primary-content">{userData?.bio ? userData.bio : "You haven't provided a bio yet."}</p>}
                            </div>
                            <div className="col-start-2 row-start-1 bg-primary p-4 rounded-box">
                                <div className="flex flex-row gap-4 w-full">
                                    <p className="text-xl font-bold text-primary-content">Email</p>
                                </div>
                                <p className="text-l text-primary-content break-words">{userData?.email}</p>
                            </div>
                            <div className="col-start-2 row-start-2 bg-primary p-4 rounded-box">
                                <div className="flex flex-row gap-4 w-full">
                                    <p className="text-xl font-bold text-primary-content">Member since</p>
                                </div>
                                <p className="text-l text-primary-content">{userDate}</p>
                            </div>
                            <div className="col-start-2 row-start-3 bg-primary p-4 rounded-box">
                                <div className="flex flex-row justify-between gap-4 w-full">
                                    <p className="text-xl font-bold text-primary-content">Name</p>
                                    {editing.name
                                        ? null
                                        : <p onClick={() => setEditing(prev => ({ ...prev, name: true }))} className="text-lg text-primary-content/80 cursor-pointer">Edit</p>
                                    }
                                </div>
                                {editing.name
                                    ? <>
                                        <div className="flex gap-2">
                                            <input
                                                className="input input-secondary"
                                                value={firstNameInput}
                                                onChange={e => setFirstNameInput(e.target.value)}
                                                placeholder="First name"
                                            />
                                            <input
                                                className="input input-secondary"
                                                value={lastNameInput}
                                                onChange={e => setLastNameInput(e.target.value)}
                                                placeholder="Last name"
                                            />
                                        </div>
                                        <div className="flex gap-2 w-full mt-2">
                                            <button className="btn btn-success btn-sm flex-1" onClick={handleSaveName}>Save</button>
                                            <button className="btn btn-neutral btn-sm flex-1" onClick={() => {
                                                setFirstNameInput(userData?.firstName ?? "");
                                                setLastNameInput(userData?.lastName ?? "");
                                                setEditing(prev => ({ ...prev, name: false }));
                                            }}>Cancel</button>
                                        </div>
                                    </>
                                    : <p className="text-l text-primary-content">{`${userData?.firstName ?? ""} ${userData?.lastName ?? ""}`}</p>}
                            </div>
                            <div className="col-start-2 row-start-4 bg-primary p-4 rounded-box">
                                <div className="flex flex-row justify-between gap-4 w-full">
                                    <p className="text-xl font-bold text-primary-content">Phone</p>
                                    {editing.phone
                                        ? null
                                        : <p onClick={() => setEditing(prev => ({ ...prev, phone: true }))} className="text-lg text-primary-content/80 cursor-pointer">Edit</p>
                                    }
                                </div>
                                {editing.phone
                                    ? <>
                                        <input
                                            className="input input-secondary"
                                            value={phoneInput}
                                            onChange={e => setPhoneInput(e.target.value)}
                                            placeholder="Phone number"
                                        />
                                        <div className="flex gap-2 w-full mt-2">
                                            <button className="btn btn-success btn-sm flex-1" onClick={handleSavePhone}>Save</button>
                                            <button className="btn btn-neutral btn-sm flex-1" onClick={() => {
                                                setPhoneInput(userData?.phoneNumber ?? "");
                                                setEditing(prev => ({ ...prev, phone: false }));
                                            }}>Cancel</button>
                                        </div>
                                    </>
                                    : <p className="text-l text-primary-content">{`${userData?.phoneNumber ?? 'N/A'}`}</p>}
                            </div>
                        </div>
                    </AnimatedPage>
                }
                {accDetails === 3 &&
                    <AnimatedPage direction="left">
                        <div className="flex flex-col gap-2 w-full p-4">
                            <div className="flex gap-4 items-center">
                                <p className="text-xl font-bold text-base-content">New events:</p>
                                <button onClick={() => handleSaveNewEventsPublic(true)} className={`btn btn-lg btn-neutral ${newEventsPublic ? 'cursor-default' : 'btn-outline'}`}>Public</button>
                                <button onClick={() => handleSaveNewEventsPublic(false)} className={`btn btn-lg btn-neutral ${newEventsPublic ? 'btn-outline' : 'cursor-default'}`}>Private</button>
                            </div>
                            <p className="text-xl text-base-content/80 pb-4 mb-4 border-b">Choose whether new events will be either public or private by default.</p>
                            <div className="flex gap-4 items-center">
                                <p className="text-xl font-bold text-base-content">Open invites:</p>
                                <button onClick={() => handleSaveOpenInvites(true)} className={`btn btn-lg btn-neutral ${openInvites ? 'cursor-default' : 'btn-outline'}`}>On</button>
                                <button onClick={() => handleSaveOpenInvites(false)} className={`btn btn-lg btn-neutral ${openInvites ? 'btn-outline' : 'cursor-default'}`}>Off</button>
                            </div>
                            <p className="text-xl text-base-content/80 pb-4 mb-4 border-b">Choose whether others can invite you to their events. Won't affect events you already participate in.</p>
                            <div className="flex gap-4 items-center">
                                <p className="text-xl font-bold text-base-content">Show in search:</p>
                                <button onClick={() => handleSaveShowsInSearch(true)} className={`btn btn-lg btn-neutral ${showsInSearch ? 'cursor-default' : 'btn-outline'}`}>On</button>
                                <button onClick={() => handleSaveShowsInSearch(false)} className={`btn btn-lg btn-neutral ${showsInSearch ? 'btn-outline' : 'cursor-default'}`}>Off</button>
                            </div>
                            <p className="text-xl text-base-content/80 pb-4 mb-4 border-b">Choose whether others can search for you.</p>
                            <div className="flex gap-4 items-center">
                                <p className="text-xl font-bold text-base-content">Contacts:</p>
                                <button onClick={() => handleSaveShareContacts(true)} className={`btn btn-lg btn-neutral ${sharesContacts ? 'cursor-default' : 'btn-outline'}`}>Public</button>
                                <button onClick={() => handleSaveShareContacts(false)} className={`btn btn-lg btn-neutral ${sharesContacts ? 'btn-outline' : 'cursor-default'}`}>Private</button>
                            </div>
                            <p className="text-xl text-base-content/80 mb-12">Choose whether your contacts appear when others view their mutual contacts with you.</p>
                            <div className="flex flex-row gap-4 w-full">
                                <button className="btn btn-error btn-lg btn-outline flex-1/2">Delete account</button>
                                <button className="btn bg-pink-300 btn-dash btn-lg btn-outline flex-1/2 hover:animate-[rainbow_2s_ease_infinite]">?</button>
                            </div>
                        </div>
                    </AnimatedPage>
                }
            </div>
        </>
    );
}

export default MyAccountDetails;
