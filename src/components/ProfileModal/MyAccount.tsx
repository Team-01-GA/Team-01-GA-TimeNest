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

    const navigate = useNavigate();

    useEffect(() => {
        if (userData) {
            const getUserDetails = async () => {
                const userObject = await getUserByHandle(userData.handle);

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
                                ? events.map((event, index) => (
                                    <div key={index * 5.481} className="flex flex-row gap-4 bg-primary w-full h-fit p-4 rounded-box">
                                        <div className="w-2 min-h-full justify-self-stretch bg-primary-content rounded-box"></div>
                                        <div className="flex flex-col gap-4 w-full p-2">
                                            <p className="text-xl text-primary-content">{event.title}</p>
                                            <p className="text-xl text-primary-content">{event.start} - {event.end}</p>
                                            <p className="text-xl text-primary-content">{event?.location}</p>
                                        </div>
                                    </div>
                                ))
                                : <>
                                    <p className="text-2xl w-[70%] self-center text-center text-base-content">You currently have no events.</p>
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
                                        <div className="flex justify-between mt-2">
                                            <button className="btn btn-success btn-sm" onClick={handleSaveBio}>Save</button>
                                            <button className="btn btn-neutral btn-sm" onClick={() => {
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
                                        <div className="flex justify-between mt-2">
                                            <button className="btn btn-success btn-sm" onClick={handleSaveName}>Save</button>
                                            <button className="btn btn-neutral btn-sm" onClick={() => {
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
                                        <div className="flex justify-between mt-2">
                                            <button className="btn btn-success btn-sm" onClick={handleSavePhone}>Save</button>
                                            <button className="btn btn-neutral btn-sm" onClick={() => {
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
                            <p className="text-xl text-base-content/80 mb-4">Choose whether new events will be either public or private by default.</p>
                            <div className="flex gap-4 items-center">
                                <p className="text-xl font-bold text-base-content">Open invites:</p>
                                <button onClick={() => handleSaveOpenInvites(true)} className={`btn btn-lg btn-neutral ${openInvites ? 'cursor-default' : 'btn-outline'}`}>On</button>
                                <button onClick={() => handleSaveOpenInvites(false)} className={`btn btn-lg btn-neutral ${openInvites ? 'btn-outline' : 'cursor-default'}`}>Off</button>
                            </div>
                            <p className="text-xl text-base-content/80 mb-6">Choose whether others can invite you to their events. Won't affect events you already participate in.</p>
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
