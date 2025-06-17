import { useContext, useEffect, useState } from "react";
import { getAllContacts, getProfileImageUrl, getUserByHandle, updateUserProfileFields } from "../../services/users.service";
import { Icons } from "../../constants/icon.constants";
import { useNavigate } from "react-router-dom";
import AlertContext from "../../providers/AlertContext";
import { AlertTypes } from "../../constants/alert.constants";

function AdminUserList({ handle }: { handle: string }) {

    const [profileImg, setProfileImg] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState<'User' | 'Admin'>('User');
    const [events, setEvents] = useState<number>(0);
    const [contacts, setContacts] = useState<number>(0);
    const [isBlocked, setIsBlocked] = useState<'Block' | 'Pardon'>('Block');

    const { showAlert } = useContext(AlertContext);

    const navigate = useNavigate();

    const handleGoToAccount = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/app/account/${handle}`);
    }

    useEffect(() => {
        const getUserDetails = async () => {
            try {
                const url = await getProfileImageUrl(handle);
                setProfileImg(url);
    
                const userObject = await getUserByHandle(handle);

                setIsAdmin(userObject.isAdmin ? 'Admin' : 'User');
                setEvents(userObject.events ? Object.keys(userObject.events).length : 0);
                setIsBlocked(userObject.isBlocked ? 'Pardon' : 'Block');
                
                const contacts = await getAllContacts(handle);
                setContacts(contacts.size);
            }
            catch (error) {
                console.error('Failed getting user details: ', error);
            }

        }

        getUserDetails();
    }, [handle]);

    const toggleUserBlock = async () => {
        try {
            if (isBlocked === 'Pardon') {
                await updateUserProfileFields(handle, { isBlocked: false });
                showAlert(AlertTypes.INFO, `User "${handle}" is no longer blocked.`);
                setIsBlocked('Block');
                return;
            } else {
                await updateUserProfileFields(handle, { isBlocked: true });
                showAlert(AlertTypes.INFO, `User "${handle}" is now blocked.`);
                setIsBlocked('Pardon');
                return;
            }
        }
        catch (error) {
            console.error(`Failed setting block status for user "${handle}": `, error);
        }
    }

    return (
        <div onClick={(e) => handleGoToAccount(e)} className={`flex flex-row gap-4 w-full p-4 pl-3 items-center justify-between cursor-pointer rounded-box bg-neutral outline outline-transparent transition-all hover:bg-transparent hover:outline-neutral group`}>
            <div className="flex flex-row gap-4 items-center">
                {profileImg 
                    ? <img className="w-12 h-12 rounded-[50%]" src={profileImg} alt="Profile picture"/>
                    : <div className={`flex flex-row justify-center items-center w-12 h-12 rounded-[50%] shadow outline outline-neutral`}>
                        <i className={`${Icons.USER_DEFAULT_PIC} text-xl text-base-300 p-0 m-0 group-hover:text-neutral`}></i>
                    </div>
                }
                <p className='text-2xl transition-all text-neutral-content group-hover:text-base-content mr-4'>{handle}</p>
                <div className="badge badge-xl transition-all group-hover:badge-neutral">{isAdmin}</div>
                <div className="badge badge-xl transition-all group-hover:badge-neutral">Events: {events}</div>
                <div className="badge badge-xl transition-all group-hover:badge-neutral">Contacts: {contacts}</div>
            </div>
            <button onClick={(e) => {
                e.stopPropagation();
                toggleUserBlock();
            }} className={`btn btn-error btn-lg ${isBlocked === 'Pardon' ? 'btn-info' : ''}`}>{isBlocked}</button>
        </div>
    );
}

export default AdminUserList;
