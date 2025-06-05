import { ModalIcons } from "../../constants/modal.constants";
import { useNewUserContext } from "../../providers/NewUserContext";
import Modal from "../Modal/Modal";
import Login from "./Login";
import Register from "./Register";


function AuthModal() {
    const { isNew } = useNewUserContext();

    return (
        <Modal title={isNew ? "Let's get you set up" : 'Good to see you again'} width="600px" icon={ModalIcons.AUTH}>
            {isNew ? <Register /> : <Login /> }
        </Modal>
    )
}

export default AuthModal;
