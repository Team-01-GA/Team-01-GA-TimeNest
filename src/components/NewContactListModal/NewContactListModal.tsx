import { useContext, useState } from "react";
import UserContext from "../../providers/UserContext";
import Modal from "../Modal/Modal";
import { addNewContactList } from "../../services/users.service";
import AlertContext from "../../providers/AlertContext";
import { AlertTypes } from "../../constants/alert.constants";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function NewContactListModal() {
    const { userData } = useContext(UserContext);
    const { showAlert } = useContext(AlertContext);
    const [listName, setListName] = useState<string>('');
    const [goBack, setGoBack] = useState<boolean>(false);
    const [blockCreate, setBlockCreate] = useState<boolean>(false);

    const navigate = useNavigate();

    const onCreate = async () => {
        if (userData && !blockCreate) {
            setBlockCreate(true);
            try {
                const result = await addNewContactList(userData, listName);
                if (result === null) {
                    throw new Error('Failed adding contact list.');
                }
                if (result) {
                    showAlert(AlertTypes.SUCCESS, `Added contact list "${listName}"`);
                    setGoBack(true);
                    setListName('');
                } else {
                    showAlert(AlertTypes.WARNING, `Contact list "${listName}" already exists.`);
                }
            }
            catch (error) {
                console.error(`Error creating new contact list ${listName}: `, error);
            } 
            finally {
                setBlockCreate(false);
            }
        }
    }

    return (
        <Modal title='New Contact List' width="400px">
            <form onSubmit={e => {
                e.preventDefault();
                onCreate();
            }}>
                <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4 gap-4">
                    <label className="floating-label">
                        <span>List name</span>
                        <input
                            className="input input-lg w-full"
                            placeholder="Work, Friends..."
                            name="name"
                            type="name"
                            disabled={blockCreate}
                            value={listName}
                            onChange={(e) => setListName(e.target.value)}
                        />
                    </label>
                    <button className='btn btn-primary btn-lg mt-4' disabled={blockCreate}>
                        Create contact list
                    </button>
                </fieldset>
            </form>
            <AnimatePresence mode="wait">
                {goBack && <motion.button
                    className="btn btn-secondary btn-lg mt-4 w-full cursor-pointer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => navigate(-1)}
                >
                    Go back...
                </motion.button>
                }
            </AnimatePresence>
        </Modal>
    )
}

export default NewContactListModal;
