import Modal from "../Modal/Modal";
import { type EventData, deleteEvent, addParticipantToEvent, removeParticipantFromEvent } from "../../services/events.service";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import UserContext from "../../providers/UserContext";
import AlertContext from "../../providers/AlertContext";
import { AlertTypes } from "../../constants/alert.constants";
import { getProfileImageUrl, getContactsAsContactListMaps } from "../../services/users.service";
import { Icons } from "../../constants/icon.constants";
import DropdownContext from "../../providers/DropdownContext";
import Dropdown from "../Dropdown/Dropdown";
import { DropdownTypes } from "../../constants/dropdown.constants";

function EventDetailsModal({ event }: { event: EventData }) {
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [contactLists, setContactLists] = useState<{ listName: string; handles: string[] }[]>([]);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [participants, setParticipants] = useState<string[]>(event.participants || []);

    const [loadingParticipance, setLoadingParticipance] = useState<boolean>(false);

    const { userData } = useContext(UserContext);
    const { showAlert } = useContext(AlertContext);
    const { openDropdown } = useContext(DropdownContext);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const getEventDetails = async () => {
            try {
                const url = await getProfileImageUrl(event.createdBy);
                setProfilePic(url);
            }
            catch (error) {
                console.error('Failed getting details for event author: ', error);
            }
        }

        getEventDetails();
    }, [event])

    useEffect(() => {
        setParticipants(event.participants || []);
    }, [event.participants]);

    const handleOpenParticipantsDropdown = async (e: React.MouseEvent) => {
        openDropdown(DropdownTypes.EDIT_EVENT_PARTICIPANTS, e);
        setLoadingContacts(true);
        try {
            if (!userData) return;
            const lists = await getContactsAsContactListMaps(userData);
            setContactLists(
                lists.map(list => ({
                    listName: list.listName,
                    handles: Object.keys(list.handlesMap)
                }))
            );
        } catch (error) {
            console.error(error);
            setContactLists([]);
        }
        setLoadingContacts(false);
    };

    const handleToggleParticipant = async (handle: string) => {
        setLoadingParticipance(true);
        if (participants.includes(handle)) {
            await removeParticipantFromEvent(event.id, handle);
            setParticipants(prev => prev.filter(h => h !== handle));
            showAlert(AlertTypes.INFO, `${handle} is now set as a participant to this event.`);
        } else {
            await addParticipantToEvent(event.id, handle);
            setParticipants(prev => [...prev, handle]);
            showAlert(AlertTypes.INFO, `${handle} is no longer a participant of this event.`);
        }
        setLoadingParticipance(false);
    };

    const handleDelete = async () => {
        try {
            await deleteEvent(event.id!, event.createdBy);
            showAlert(AlertTypes.SUCCESS, "Event deleted successfully.");
            navigate(-1);
        } catch (err) {
            console.error("Failed to delete event", err);
            showAlert(AlertTypes.ERROR, "Failed to delete event.");
        }
    };

    return (
        <>
            <Modal title={'Event Details'} width="600px">
                <div className="flex flex-col gap-2 p-4 bg-base-300 rounded-box">
                    {event.createdOn && <p className="text-md w-full text-center text-base-content/70">Created on {new Date(event.createdOn).toLocaleString()}</p>}
                    <p className="text-3xl font-bold w-full text-center">{event.title}</p>
                    <div onClick={() => {
                        if (!location.pathname.includes('welcome')) navigate(`/app/account/${event.createdBy}`);
                    }} 
                        className="flex flex-row gap-4 p-2 pr-4 pl-4 w-fit self-center justify-center items-center rounded-box transition-all cursor-pointer group hover:bg-base-100"
                    >
                        {profilePic 
                            ? <img className="w-10 h-10 rounded-[50%]" src={profilePic} alt="Profile picture"/>
                            : <div className={`flex flex-row bg-base-200 justify-center items-center w-10 h-10 rounded-[50%] outline outline-transparent shadow group-hover:outline-base-300`}>
                                <i className={`${Icons.USER_DEFAULT_PIC} text-xl text-primary p-0 m-0`}></i>
                            </div>
                        }
                        <p className="text-2xl">{event.createdBy}</p>
                    </div>
                    {event.location && <p className="text-xl text-base-content/70 w-full text-center">{event.location}</p>}
                    <p className="text-lg text-base-content/70 w-full text-center">{new Date(event.start).toLocaleString()}{' - '}{new Date(event.end).toLocaleString()}</p>
                </div>
                {participants?.length > 0 && participants.some(user => user !== event.createdBy) 
                        ? <div className="flex flex-col gap-2 p-4 mt-4 bg-secondary rounded-box">
                            <div className="flex justify-between">
                                <p className="text-lg text-secondary-content/90">Participants ({participants.length - 1})</p>
                                {userData?.handle === event.createdBy && <button className="btn btn-md btn-neutral btn-outline" onClick={handleOpenParticipantsDropdown}>Edit</button>}
                            </div>
                            <ul className="flex flex-wrap justify-center gap-2 max-h-32 overflow-y-auto p-2">
                                {participants.map((handle) => {
                                    if (handle !== event.createdBy) {
                                        return (
                                            <div key={handle}>
                                                {!location.pathname.includes('welcome')
                                                    ? <Link
                                                        to={`/app/account/${handle}`}
                                                        className="text-lg text-center w-fit p-1 pl-3 pr-3 bg-base-100 outline outline-transparent rounded-box transition-all hover:bg-transparent hover:outline-base-100"
                                                    >
                                                        @{handle}
                                                    </Link>
                                                    : <p className="block px-2 py-1 bg-base-100 rounded-box hover:bg-base-200 transition text-md text-center">@{handle}</p>
                                                }
                                            </div>
                                        );
                                    }
                                })}
                            </ul>
                        </div>
                        : <div className="flex justify-between p-4 mt-4 bg-secondary rounded-box items-center">
                            <p className="text-lg text-secondary-content/90">Participants (None)</p>
                            {userData?.handle === event.createdBy && <button className="btn btn-md btn-neutral btn-outline" onClick={handleOpenParticipantsDropdown}>Edit</button>}
                        </div>
                    }
                {event.description && 
                    <div className="flex flex-col gap-2 p-4 mt-4 bg-accent rounded-box">
                        <p className="text-lg text-accent-content/70">Info</p>
                        <p className="text-xl text-accent-content break-words">{event.description}</p>
                    </div>
                }
                <div className="sticky bottom-0 flex flex-row gap-4 w-full mt-4">
                    {userData && event.createdBy !== userData.handle && (
                        !participants.includes(userData.handle) ? (
                            <button
                                className="btn btn-md btn-primary flex-1"
                                disabled={loadingParticipance}
                                onClick={async () => {
                                    await addParticipantToEvent(event.id, userData.handle);
                                    setParticipants(prev => [...prev, userData.handle]);
                                    showAlert(AlertTypes.INFO, "You have joined this event.");
                                }}
                            >
                                Join Event
                            </button>
                        ) : (
                            <button
                                className="btn btn-md bg-primary-content text-primary flex-1"
                                disabled={loadingParticipance}
                                onClick={async () => {
                                    await removeParticipantFromEvent(event.id, userData.handle);
                                    setParticipants(prev => prev.filter(h => h !== userData.handle));
                                    showAlert(AlertTypes.INFO, "You have left this event.");
                                }}
                            >
                                Leave Event
                            </button>
                        )
                    )}
                    {userData && (userData.handle === event.createdBy || userData.isAdmin) && (
                        <>
                            <button onClick={() => navigate(`/app/event/edit/${event.id}`)} className="btn btn-md btn-neutral btn-outline flex-1">Edit</button>
                            <button onClick={(e) => openDropdown(DropdownTypes.USER_DELETE_EVENT, e)} className="btn btn-md btn-error btn-outline flex-1">Delete</button>
                            <Dropdown title="Delete this event?" keyToOpen={DropdownTypes.USER_DELETE_EVENT} clickCloses={true}>
                                <div className="w-full flex flex-col gap-2 drop-shadow-none">
                                    <button onClick={handleDelete} className="btn btn-lg btn-error drop-shadow-none">Confirm</button>
                                    <button className="btn btn-lg btn-neutral drop-shadow-none">Cancel</button>
                                </div>
                            </Dropdown>
                        </>
                    )}
                </div>
                <Dropdown
                    title="Edit participants"
                    keyToOpen={DropdownTypes.EDIT_EVENT_PARTICIPANTS}
                    clickCloses={false}
                >
                    <div className="w-full flex flex-col gap-4 max-h-80 overflow-y-auto">
                        {loadingContacts && <p>Loading...</p>}
                        {!loadingContacts && contactLists.length === 0 && (
                            <>
                                <p className="text-center text-base-content/70">No contact lists found.</p>
                                <button onClick={() => navigate('/app/account/create-list')} className="btn btn-lg btn-neutral btn-outline">Add contact list</button>
                            </>
                        )}
                        {!loadingContacts && contactLists.map(({ listName, handles }) => (
                            <div key={listName} className='mb-0' >
                                <div className='flex gap-4 w-full items-center justify-center mb-2'>
                                    <p className="text-xl text-base-content">{listName}</p>
                                    <div className="w-full h-1 self-center rounded-full bg-base-content"></div>
                                </div>
                                <div className="flex flex-col gap-2 items-center">
                                    {handles.map(userHandle => (
                                        <button
                                            key={userHandle}
                                            disabled={loadingParticipance}
                                            className={`btn btn-lg w-full flex items-center justify-center ${participants.includes(userHandle) ? 'btn-success hover:btn-error' : 'hover:btn-success'}`}
                                            onClick={() => handleToggleParticipant(userHandle)}
                                        >
                                            @{userHandle}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </Dropdown>
            </Modal>
        </>
    );
}

export default EventDetailsModal;