import Modal from "../Modal/Modal";

type AuthProps = {
    isNew: boolean,
    visible: boolean,
}

function AuthModal({ isNew, visible }: AuthProps) {
    return (
        <Modal title="Welcome" width="400px" height="600px" visibility={visible}>
            {isNew ? 'Register' : 'Login' }
        </Modal>
    )
}

export default AuthModal;
