import { useContext, useState, useEffect, type CSSProperties } from "react";
import UserContext from "../../providers/UserContext";
import type { AccountProps } from "./MyAccount";
import AnimatedPage from "../AnimatedPage";
import { toggleUserToContacts } from "../../services/users.service";
import AlertContext from "../../providers/AlertContext";
import { AlertTypes } from "../../constants/alert.constants";

function OtherAccountsDetails({userObject, events}: AccountProps) {
    
    const { userData, setUserData } = useContext(UserContext);
    const { showAlert } = useContext(AlertContext);

    const [accDetails, setAccDetails] = useState<number>(1);
    const [mutualContacts, setMutualContacts] = useState<string[]>([]);
    const [userDate, setUserDate] = useState<string | undefined>('');
    const [userFullName, setUserFullName] = useState<string | undefined>('');
    const [isFriend, setIsFriend] = useState<boolean>(false);

    useEffect(() => {
        if (userObject && userData) {
            setUserDate(new Date(+userObject.createdOn).toLocaleDateString());
            setUserFullName(`${userObject.firstName} ${userObject.lastName}`);
            if (userData.contacts) {
                setIsFriend(Object.keys(userData.contacts).includes(userObject.handle));
            }

            if (userObject.sharesContacts && userData?.contacts && userObject?.contacts) {
                const loggedInUserContacts = Object.keys(userData.contacts);

                const otherUserContactsSet = new Set(Object.keys(userObject.contacts));
    
                const mutual = loggedInUserContacts.filter(handle => otherUserContactsSet.has(handle));
                setMutualContacts(mutual);
            } else {
                setMutualContacts([]);
            }
        }
    }, [userData, userObject]);

    const toggleFriendStatus = async (): Promise<void> => {
        if (userData && userObject) {
            try {
                const status = await toggleUserToContacts(userData, userObject.handle);
                if (status === undefined) return;

                const newContacts = { ...(userData.contacts || {}) };
                if (status) {
                    newContacts[userObject.handle] = true;
                    showAlert(AlertTypes.SUCCESS, `Added ${userObject.handle} to contacts.`);
                } else {
                    delete newContacts[userObject.handle];
                    showAlert(AlertTypes.ERROR, `Removed ${userObject.handle} from contacts.`);
                }

                setUserData({ ...userData, contacts: newContacts });
                setIsFriend(status);
            } catch (error) {
                console.error('Failed setting friend status: ', error);
            }
        }
    }

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
            {userObject?.handle !== userData?.handle && <button onClick={toggleFriendStatus} className={`btn btn-xl mt-2 transition-all ${isFriend ? 'btn-error' : 'btn-success'}`}>{isFriend ? 'Remove from contacts' : 'Add to contacts'}</button>}
            <div className="sticky top-0 flex flex-row justify-center items-center w-[103%] bg-base-100/60 backdrop-blur-[3px] pt-4 pb-4">
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
            <div className="w-full  overflow-x-hidden">
                {accDetails === 1 && 
                    <AnimatedPage direction="left">
                        <div className="flex flex-col gap-4 w-full">
                            {events.map((event, index) => (
                                <div key={index*5.481} className="flex flex-col gap-4 bg-primary w-full p-4 rounded-box">
                                    <p className="text-xl text-primary-content">{event.title}</p>
                                    <p className="text-xl text-primary-content">{event.start} - {event.end}</p>
                                    <p className="text-xl text-primary-content">{event?.location}</p>
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
