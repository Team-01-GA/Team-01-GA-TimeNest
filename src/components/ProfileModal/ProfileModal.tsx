import { useContext, useEffect, useRef, useState } from "react";
import Modal from "../Modal/Modal";
import UserContext, { type UserData } from "../../providers/UserContext";
import { Icons } from "../../constants/icon.constants";
import { useParams } from "react-router-dom";
import { getProfileImageUrl, getUserByHandle } from "../../services/users.service";
import { getAllEvents, type EventData } from "../../services/events.service";
import MyAccountDetails from "./MyAccount";
import OtherAccountsDetails from "./OtherAccounts";

function ProfileModal() {

    const { userData } = useContext(UserContext);

    const { userHandle } = useParams();

    const [modalTitle, setModalTitle] = useState<string>('');

    const [loading, setLoading] = useState<boolean>(true);

    const [userToView, setUserToView] = useState<string>('');
    const [userPicture, setUserPicture] = useState<string | null>(null);
    const [otherUser, setOtherUser] = useState<UserData | null>(null);
    const [userEvents, setUserEvents] = useState<EventData[]>([]);

    const profileModalRef = useRef<HTMLDivElement>(null);
    const userToViewRef = useRef<HTMLParagraphElement>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        if (userData && userHandle) {
            setLoading(true);

            const getUserDetails = async (): Promise<void> => {
                try {
                    if (userData.handle === userHandle) {
                        setModalTitle('My TimeNest Account');
                        setUserToView(userData.handle);
                        setUserPicture(userData?.profileImg ?? null);
                    } else {
                        setModalTitle('Contact');
                        setUserToView(userHandle);
                        const url = await getProfileImageUrl(userHandle);
                        setUserPicture(url);
                    }

                    const userObject = await getUserByHandle(userHandle);
                    setOtherUser(userObject);
                    const events = await getAllEvents();
                    
                    const handle = userObject.handle;
                    
                    const userParticipatingEvents = events.filter(event => event.participants.includes(handle));

                    setUserEvents(userParticipatingEvents);
                }
                catch (error) {
                    if (error instanceof Error) {
                        console.error('Failed getting user details: ', error.message);
                    } else {
                        console.error('Failed getting user details: ', error);
                    }
                }
                finally {
                    setLoading(false);
                }
            }
            
            getUserDetails();
        }
    }, [userData, userHandle])

    useEffect(() => {
        const modalRoot = profileModalRef.current;
        const target = userToViewRef.current;
        if (!modalRoot || !target) return;

        const observer = new window.IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            {
                root: modalRoot,
                threshold: 0.1,
                rootMargin: "-100px 0px 0px 0px"
            }
        );

        observer.observe(target);

        return () => {
            observer.disconnect();
        };
    }, [userToView, loading]);

    return (
        <Modal title={`${modalTitle}${userData?.handle !== userHandle ? inView ? '' : ` - ${userHandle}` : ''}`} width="800px" ref={profileModalRef}>
            <div className="relative flex flex-col items-center w-full gap-4">
                {userPicture 
                    ? <img className="w-24 h-24 rounded-[50%] cursor-pointer" src={userPicture} alt="Profile picture"/>
                    : <div className="flex flex-row justify-center items-center w-24 h-24 rounded-[50%] bg-primary cursor-pointer">
                        <i className={`${Icons.USER_DEFAULT_PIC} text-3xl text-primary-content p-0 m-0`}></i>
                    </div>
                }
                <p className={`text-2xl transition-all duration-[0.3s] ${inView ? 'opacity-100' : 'opacity-0'}`} ref={userToViewRef}>{userToView}</p>
                {!loading
                    ? userHandle === userData?.handle
                        ? <MyAccountDetails events={userEvents} />
                        : <OtherAccountsDetails userObject={otherUser} events={userEvents}/>
                    : <div className="flex justify-center items-center h-32">
                        <div className="loader"></div>
                    </div>
                }
            </div>
        </Modal>
    )
}

export default ProfileModal;
