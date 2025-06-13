import { useContext, useEffect, useState } from 'react';
import UserContext from '../../providers/UserContext';
import { getContactsAsContactListMaps } from '../../services/users.service';
import ContactListRow from './ContactListRow';
import { useNavigate } from 'react-router-dom';
import LocationContext from '../../providers/LocationContext';

function ContactList() {

    const { userData } = useContext(UserContext);
    const { location } = useContext(LocationContext);

    const [contactLists, setContactLists] = useState<{ listName: string; handlesMap: Record<string, boolean | null> }[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const navigate = useNavigate();

    useEffect(() => {
        if (userData) {
            const getUserDetails = async () => {
                try {
                    const contacts = await getContactsAsContactListMaps(userData);
                    setContactLists(contacts);
                }
                catch (error) {
                    console.error('Failed fetching contact lists: ', error);
                }
                finally {
                    setLoading(false);
                }
            }

            getUserDetails();
        }
    }, [userData, location])

    if (loading) return (
        <div className="flex justify-center items-center h-32">
            <div className="loader"></div>
        </div>
    );

    return (
        <div className="relative flex-1 overflow-y-auto p-2 space-y-2">
            <div className="flex flex-col gap-4">
                {contactLists.length 
                    ? <>
                        <button onClick={() => navigate('/app/account/create-list')} className="btn btn-lg btn-neutral btn-outline">Add contact list</button>
                        {contactLists.map(({ listName, handlesMap }, index) => <ContactListRow key={index*1.6378} listName={listName} handlesMap={handlesMap}/>)}
                    </>
                    : <>
                        <p className="text-xl w-full text-center mb-4">You have no contact lists.</p>
                        <button onClick={() => navigate('/app/account/create-list')} className="btn btn-lg btn-neutral btn-outline">Add contact list</button>
                    </>
                }
            </div>
        </div>
    );
}

export default ContactList;
