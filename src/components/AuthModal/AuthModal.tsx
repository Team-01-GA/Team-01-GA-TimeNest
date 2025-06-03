import { ModalIcons } from "../../constants/modal.constants";
import Modal from "../Modal/Modal";
import Login from "./Login";
import Register from "./Register";

type AuthProps = {
    isNew: boolean,
    visible: boolean,
}

function AuthModal({ isNew, visible }: AuthProps) {
    return (
        <Modal title={isNew ? "Let's get you set up" : 'Good to see you again'} width="600px" visibility={visible} icon={ModalIcons.AUTH}>
            {isNew ? <Register /> : <Login /> }
        </Modal>
    )
}

export default AuthModal;
