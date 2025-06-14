import { useState } from "react";
import { Icons } from "../../constants/icon.constants";
import { useNewUserContext } from "../../providers/NewUserContext";
import Modal from "../Modal/Modal";
import Login from "./Login";
import Register from "./Register";


function AuthModal() {
    const { isNew } = useNewUserContext();
    const [loading, setLoading] = useState<boolean>(false);

    return (
        <Modal title={isNew ? "Let's get you set up" : 'Good to see you again'} width="600px" icon={Icons.MODAL_AUTH} className={loading ? 'animate-[auth-anim_2s_ease_infinite]' : ''}>
            {isNew ? <Register loading={loading} setLoading={setLoading} /> : <Login loading={loading} setLoading={setLoading} /> }
        </Modal>
    )
}

export default AuthModal;
