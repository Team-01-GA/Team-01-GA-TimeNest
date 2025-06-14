import { useContext, useState, useEffect, type CSSProperties } from "react";
import UserContext, { type UserData } from "../../providers/UserContext";
import AnimatedPage from "../AnimatedPage";
import { addUserToContactList, checkUserInContacts, getAllContacts, getContactsAsContactListMaps, removeUserFromContactList } from "../../services/users.service";
import AlertContext from "../../providers/AlertContext";
import { AlertTypes } from "../../constants/alert.constants";
import { Icons } from "../../constants/icon.constants";
import DropdownContext from "../../providers/DropdownContext";
import { DropdownTypes } from "../../constants/dropdown.constants";
import Dropdown from "../Dropdown/Dropdown";
import type { EventData } from "../../services/events.service";
import { useNavigate } from "react-router-dom";
import LocationContext from "../../providers/LocationContext";

type OtherAccountProps = {
    userObject: UserData;
    events: EventData[];
}

function OtherAccountsDetails({userObject, events}: OtherAccountProps) {
    
    const { userData } = useContext(UserContext);
    const { location } = useContext(LocationContext);
    const { showAlert } = useContext(AlertContext);
    const { openDropdown } = useContext(DropdownContext);

    const [accDetails, setAccDetails] = useState<number>(1);
    const [mutualContacts, setMutualContacts] = useState<string[]>([]);
    const [userDate, setUserDate] = useState<string | undefined>('');
    const [userFullName, setUserFullName] = useState<string | undefined>('');
    const [isFriend, setIsFriend] = useState<boolean>(false);
    const [contactLists, setContactLists] = useState<{ listName: string; handlesMap: Record<string, boolean | null> }[]>([]);
    const [contactActionsDisabled, setContactActionsDisabled] = useState<boolean>(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (userObject && userData) {
            const getUserDetails = async () => {
                try {
                    setUserDate(new Date(+userObject.createdOn).toLocaleDateString());
                    setUserFullName(`${userObject.firstName} ${userObject.lastName}`);
                    if (userData.contacts) {
                        const contacts = await getContactsAsContactListMaps(userData);
                        setContactLists(contacts);

                        const isInContacts = await checkUserInContacts(userData, userObject.handle);
                        setIsFriend(isInContacts);
                    }
        
                    if (userObject.sharesContacts && userData?.contacts && userObject?.contacts) {
                        const loggedInUserContacts = await getAllContacts(userData.handle);
                        const otherUserContacts = await getAllContacts(userObject.handle);
                        
                        const mutual = [...loggedInUserContacts].filter(contact => otherUserContacts.has(contact));
                        setMutualContacts(mutual);
                    } else {
                        setMutualContacts([]);
                    }
                }
                catch (error) {
                    console.error('Failed getting user details: ', error);
                }
            }

            getUserDetails();
        }
    }, [userData, userObject, location]);

    const toggleContactToList = async (listName: string) => {
        if (!contactActionsDisabled) {
            setContactActionsDisabled(true);

            if (!userData) return;

            const list = contactLists.find(l => l.listName === listName);
            if (!list) return;

            const isInList = !!list.handlesMap[userObject.handle];

            try {
                if (isInList) {
                    await removeUserFromContactList(userData, userObject.handle, listName);
                    showAlert(AlertTypes.ERROR, `Removed ${userObject.handle} from list "${listName}".`);
                } else {
                    await addUserToContactList(userData, userObject.handle, listName);
                    showAlert(AlertTypes.SUCCESS, `Added ${userObject.handle} to list "${listName}".`);
                }

                setContactLists(prevLists => {
                    const updatedLists = prevLists.map(l => {
                        if (l.listName !== listName) return l;
                        const newHandlesMap = { ...l.handlesMap };
                        if (isInList) {
                            delete newHandlesMap[userObject.handle];
                        } else {
                            newHandlesMap[userObject.handle] = true;
                        }
                        return {
                            ...l,
                            handlesMap: newHandlesMap,
                        };
                    });

                    const anyListHasHandle = updatedLists.some(
                        l => !!l.handlesMap[userObject.handle]
                    );
                    setIsFriend(anyListHasHandle);

                    return updatedLists;
                });
            } catch (error) {
                showAlert(AlertTypes.ERROR, "Failed to update contact list.");
                console.error(error);
            } finally {
                setContactActionsDisabled(false);
            }
        }
    };

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
        width: accDetails === 2
            ? '11rem'
            : '6rem',
        transition: 'all 0.3s ease'
    }

    return (
        <>
            {userObject?.handle !== userData?.handle && 
                <button 
                    onClick={(e) => openDropdown(DropdownTypes.PROFILE_MODAL_CONTACTS, e)} 
                    className={`btn btn-xl mt-2 transition-all ${isFriend ? 'btn-neutral' : 'btn-success'}`}
                >
                    {isFriend ? 'In contacts' : 'Add to contacts'}
                </button>
            }
            <Dropdown title='Contact lists' keyToOpen={DropdownTypes.PROFILE_MODAL_CONTACTS}>
                <div className="flex flex-col gap-4">
                        {contactLists.length
                            ? contactLists?.map(({ listName, handlesMap }, index) => {
                                const isInList = !!handlesMap[userObject.handle];

                                return <div onClick={() => toggleContactToList(listName)} key={index*1.398} className={`relative flex flex-row justify-between items-center w-[300px] gap-4 pt-2 pr-8 pb-2 pl-4 flex-nowrap border-1 rounded-box cursor-pointer transition-all duration-[0.3s] group ${isInList ? 'bg-success hover:bg-error' : 'hover:bg-success'}`}>
                                    <p className={`text-2xl pointer-events-none whitespace-break-spaces truncate transition-all duration-[0.3s] ${isInList ? 'text-success-content group-hover:text-error-content' : 'group-hover:text-success-content'}`}>{listName}</p>
                                    <i className={`${isInList ? Icons.REMOVE : Icons.ADD} absolute top-1/2 right-[-10px] transform translate-y-[-50%] text-2xl pointer-events-none opacity-0 mr-4 group-hover:opacity-100 group-hover:right-[-2px] transition-all duration-[0.3s] ${isInList ? 'text-success-content group-hover:text-error-content' : 'group-hover:text-success-content'}`}></i>
                                </div>
                            })
                            : <>
                                <p className="text-2xl w-full text-center">You have no contact lists.</p>
                                <button onClick={() => navigate('/app/account/create-list')} className="btn btn-lg btn-neutral btn-outline">Add contact list</button>
                            </>
                        }
                    </div>
            </Dropdown>
            <div className="sticky top-0 z-[2] flex flex-row justify-center items-center w-[103%] bg-base-100/60 backdrop-blur-[3px] pt-0 pb-4">
                <div className="flex flex-row w-fit justify-center relative gap-4">
                    <button className="bg-secondary rounded-box text-2xl absolute top-1/2 transform translate-y-[-50%] p-1 m-0 text-transparent z-0 pointer-events-none whitespace-nowrap" style={higlighterStyles} disabled>
                        {accDetails === 1 && 'Events'}
                        {accDetails === 2 && 'Mutual Contacts'}
                        {accDetails === 3 && 'Details'}
                    </button>
                    <button onClick={() => setAccDetails(1)} className="btn w-24 p-0 m-0 z-10 bg-transparent border-none text-xl text-base-content cursor-pointer whitespace-nowrap">Events</button>
                    <button onClick={() => setAccDetails(2)} className="btn w-44 p-0 m-0 z-10 bg-transparent border-none text-xl text-base-content cursor-pointer whitespace-nowrap">Mutual Contacts</button>
                    <button onClick={() => setAccDetails(3)} className="btn w-24 p-0 m-0 z-10 bg-transparent border-none text-xl text-base-content cursor-pointer whitespace-nowrap">Details</button>
                </div>
            </div>
            <div className="w-full p-4 bg-base-200 rounded-box overflow-x-hidden">
                {accDetails === 1 && 
                    <AnimatedPage direction="left">
                        <div className="flex flex-row justify-end items-center pb-4">
                            
                        </div>
                        <div className="flex flex-col gap-4 w-full">
                            {events.map((event, index) => (
                                <div key={index*5.481} className="flex flex-row gap-4 bg-primary w-full h-fit p-4 rounded-box">
                                    <div className="w-2 min-h-full justify-self-stretch bg-primary-content rounded-box"></div>
                                    <div className="flex flex-col gap-4 w-full p-2">
                                    <p className="text-xl text-primary-content">{event.title}</p>
                                    <p className="text-xl text-primary-content">{event.start} - {event.end}</p>
                                    <p className="text-xl text-primary-content">{event?.location}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AnimatedPage>
                }
                {accDetails === 2 &&
                    <AnimatedPage direction="left">
                        <div className="flex flex-col gap-4 w-full">
                            {mutualContacts.length
                                ? mutualContacts.map((contact, index) => (
                                    <div key={index*23.75} className="flex flex-col gap-4 bg-primary w-full p-4 rounded-box">
                                        <p>{contact}</p>
                                    </div>
                                ))
                                : <p className="text-2xl w-full text-center">You and <strong>{userObject?.handle}</strong> have no mutual contacts.</p>
                            }
                        </div>
                    </AnimatedPage>
                }
                {accDetails === 3 &&
                    <AnimatedPage direction="left">
                        <div className="grid grid-cols-[50%_50%] grid-rows-3 gap-4 h-fit w-[97%]">
                            <div className="col-start-1 row-span-3 bg-primary p-4 rounded-box">
                                <p className="text-xl font-bold text-primary-content">Bio</p>
                                <p className="text-l text-primary-content">{userObject?.bio ? userObject.bio : 'This user has not provided a bio, yet.'}</p>
                            </div>
                            <div className="col-start-2 row-start-1 bg-primary p-4 rounded-box">
                                <p className="text-xl font-bold text-primary-content">Email</p>
                                <p className="text-l text-primary-content break-words">{userObject?.email}</p>
                            </div>
                            <div className="col-start-2 row-start-2 bg-primary p-4 rounded-box">
                                <p className="text-xl font-bold text-primary-content">Member since</p>
                                <p className="text-l text-primary-content">{userDate}</p>
                            </div>
                            <div className="col-start-2 row-start-3 bg-primary p-4 rounded-box">
                                <p className="text-xl font-bold text-primary-content">Name</p>
                                <p className="text-l text-primary-content">{userFullName}</p>
                            </div>
                        </div>
                    </AnimatedPage>
                }
            </div>
        </>
    );
}

export default OtherAccountsDetails;
