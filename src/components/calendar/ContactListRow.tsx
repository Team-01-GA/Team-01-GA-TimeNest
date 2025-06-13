import { useEffect, useState } from "react";
import { Icons } from "../../constants/icon.constants";
import UserListRow from "./UserListRow";


function ContactListRow({ listName, handlesMap }: { listName: string; handlesMap: Record<string, boolean | null> }) {

    const [expanded, setExpanded] = useState<boolean>(false);
    const [contactList, setContactList] = useState<string[]>(Object.keys(handlesMap));

    useEffect(() => {
        setContactList(Object.keys(handlesMap));
    }, [handlesMap])

    return (
        <div className="flex flex-col justify-center gap-4 w-full bg-primary rounded-box p-4">
            <div onClick={() => setExpanded(prev => !prev)} className={`flex flex-row items-center gap-2 w-full ${contactList.length > 0 ? 'cursor-pointer' : ''}`}>
                {contactList.length > 0 && <i className={`${expanded ? Icons.REMOVE : Icons.ADD} text-xl text-primary-content`}></i>}
                <p className="text-xl text-primary-content whitespace-normal">{`${listName} ${!contactList.length ? '(Empty)' : ''}`}</p>
            </div>
            {expanded && contactList.length > 0 && 
                <div className="flex flex-col gap-2">
                    {contactList.map((handle, index) => {
                            if (handle === '_init') return null;
                    
                            return <div key={index*6.2523}>
                                <UserListRow handle={handle} />
                                {index !== (contactList.length - 1) && <div className="h-[1px] w-full mt-2 mb-2 bg-primary-content rounded-box"></div>}
                            </div>
                        }) 
                    }
                </div>
            }
        </div>
    );
}

export default ContactListRow;
