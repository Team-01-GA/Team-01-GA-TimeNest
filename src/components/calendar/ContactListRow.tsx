import { useContext, useEffect, useState } from "react";
import { Icons } from "../../constants/icon.constants";
import UserListRow from "./UserListRow";
import Dropdown from "../Dropdown/Dropdown";
import { DropdownTypes } from "../../constants/dropdown.constants";
import DropdownContext from "../../providers/DropdownContext";
import { removeContactList } from "../../services/users.service";
import UserContext from "../../providers/UserContext";
import { AlertTypes } from "../../constants/alert.constants";
import AlertContext from "../../providers/AlertContext";
import { useNavigate } from "react-router-dom";


function ContactListRow({ listName, handlesMap }: { listName: string; handlesMap: Record<string, boolean | null> }) {

    const [expanded, setExpanded] = useState<boolean>(false);
    const [contactList, setContactList] = useState<string[]>(Object.keys(handlesMap));

    const { userData } = useContext(UserContext);
    const { openDropdown } = useContext(DropdownContext);
    const { showAlert } = useContext(AlertContext);

    const navigate = useNavigate();

    const handleDeleteList = async () => {
        if (userData) {
            try {
                const result = await removeContactList(userData, listName);
                if (result === null) {
                    throw new Error(`Failed removing contact list "${listName}".`);
                }
                if (result) {
                    showAlert(AlertTypes.SUCCESS, `Removed contact list "${listName}"`);
                    navigate('/app', {replace: true});
                } else {
                    showAlert(AlertTypes.ERROR, `Contact list "${listName}" not found.`);
                }
            }
            catch (error) {
                console.error(`Error removing contact list ${listName}: `, error);
            }
        }
    };

    useEffect(() => {
        setContactList(Object.keys(handlesMap));
    }, [handlesMap])

    return (
        <div className="flex flex-col justify-center gap-4 w-full bg-primary rounded-box p-4">
            <div onClick={() => setExpanded(prev => !prev)} className={`relative flex flex-row items-center gap-2 w-full group ${contactList.length > 0 ? 'cursor-pointer' : ''}`}>
                {contactList.length > 0 && <i className={`${expanded ? Icons.REMOVE : Icons.ADD} text-xl text-primary-content`}></i>}
                <p className="text-xl text-primary-content whitespace-normal">{`${listName} ${!contactList.length ? '(Empty)' : ''}`}</p>
                <i 
                    onClick={(e) => {
                        e.stopPropagation();
                        openDropdown(DropdownTypes.DELETE_LIST, e);
                    }} 
                    className={`${Icons.X} absolute top-1/2 transform translate-y-[-50%] right-2 text-xl text-primary-content text-center rounded-[50%] p-2 pl-[0.65rem] pr-[0.65rem] m-0 bg-transparent opacity-0 shadow transition-all cursor-pointer group-hover:opacity-100 hover:bg-error hover:text-error-content`}>
                </i>
                <div onClick={(e) => e.stopPropagation()}>
                    <Dropdown title="Delete this list?" keyToOpen={DropdownTypes.DELETE_LIST} clickCloses={true}>
                        <div className="w-full flex flex-col gap-2 drop-shadow-none">
                            <button onClick={handleDeleteList} className="btn btn-lg btn-error drop-shadow-none">Confirm</button>
                            <button className="btn btn-lg btn-neutral drop-shadow-none">Cancel</button>
                        </div>
                    </Dropdown>
                </div>
            </div>
            {expanded && contactList.length > 0 && 
                <div className="flex flex-col gap-2">
                    {contactList.map((handle, index) => {
                        if (handle === '_init') return null;
                    
                        return <div key={index*6.2523}>
                            <UserListRow handle={handle} />
                            {index !== (contactList.length - 1) && <div className="h-[1px] w-full mt-2 mb-2 bg-primary-content rounded-box"></div>}
                        </div>
                    })}
                </div>
            }
        </div>
    );
}

export default ContactListRow;