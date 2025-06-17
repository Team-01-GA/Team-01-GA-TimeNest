import { useContext, useEffect, useRef, useState } from "react";
import Modal from "../Modal/Modal";
import UserContext, { type UserData } from "../../providers/UserContext";
import { Icons } from "../../constants/icon.constants";
import { useParams } from "react-router-dom";
import { getProfileImageUrl, getUserByHandle } from "../../services/users.service";
import { getUserEvents, type EventData } from "../../services/events.service";
import MyAccountDetails from "./MyAccount";
import OtherAccountsDetails from "./OtherAccounts";
import { AnimatePresence, motion } from "framer-motion";
import ProfileImagePicker from "./ProfileImagePicker";

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
    const [changeProfilePic, setChangeProfilePic] = useState<boolean>(false);

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

                    const userObject = await getUserByHandle(userHandle) as UserData;
                    setOtherUser(userObject);
                    const events = await getUserEvents(userObject.handle);

                    setUserEvents(events);
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
            <AnimatePresence>
                {userData?.handle === userHandle && changeProfilePic && 
                    <motion.div
                        className="absolute top-0 left-0 w-full h-full bg-base-100 flex flex-col justify-center items-center gap-4 rounded-box z-50"
                        initial={{ opacity: 0, clipPath: 'inset(0 0 0 100% round 1rem)' }}
                        animate={{ opacity: 1, clipPath: 'inset(0 0 0 0 round 1rem)' }}
                        exit={{ opacity: 0, clipPath: 'inset(0 0 0 100% round 1rem)' }}
                        transition={{ duration: 0.5 }}
                    >
                        <p className="absolute top-0 left-0 mt-5 text-base-content text-4xl self-center justify-self-center w-full text-center font-bold bg-transparent">Change profile picture</p>
                        <ProfileImagePicker setChangeProfilePic={setChangeProfilePic}/>
                        <button onClick={() => setChangeProfilePic(false)} className="btn btn-secondary btn-lg w-[70%]">Back</button>
                    </motion.div>
                }
            </AnimatePresence>
            <div className="relative flex flex-col items-center w-full gap-4">
                {userPicture 
                    ? <img onClick={() => setChangeProfilePic(true)} className={`w-24 h-24 rounded-[50%] ${userData?.handle !== userHandle ? '' : 'cursor-pointer'}`} src={userPicture} alt="Profile picture"/>
                    : <div onClick={() => setChangeProfilePic(true)} className={`flex flex-row justify-center items-center w-24 h-24 rounded-[50%] bg-primary ${userData?.handle !== userHandle ? '' : 'cursor-pointer'}`}>
                        <i className={`${Icons.USER_DEFAULT_PIC} text-3xl text-primary-content p-0 m-0`}></i>
                    </div>
                }
                <p className={`text-3xl font-bold transition-all duration-[0.3s] ${inView ? 'opacity-100' : 'opacity-0'}`} ref={userToViewRef}>{userToView}</p>
                {!loading
                    ? userHandle === userData?.handle
                        ? <MyAccountDetails events={userEvents} />
                        : otherUser && <OtherAccountsDetails userObject={otherUser} events={userEvents}/>
                    : <div className="flex justify-center items-center h-32">
                        <div className="loader"></div>
                    </div>
                }
            </div>
        </Modal>
    )
}

export default ProfileModal;
