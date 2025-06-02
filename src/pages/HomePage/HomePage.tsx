import { useContext, useState } from "react";
import AuthModal from "../../components/AuthModal/AuthModal";
import { ModalKeys } from "../../constants/modal.constants";
import ModalContext from "../../providers/ModalContext";

function HomePage() {

    const { modalKey, openModal } = useContext(ModalContext);
    const [isNew, setIsNew] = useState<boolean>(true);

    const toggleAuth = (isNewFlag: boolean) => {
        setIsNew(isNewFlag);
        openModal(ModalKeys.AUTH)
    }

    return (
        <div className="flex flex-col items-center justify-center gap-8 w-full h-full">
            <div className="flex flex-col">
                <p className="text-center text-2xl">Your schedule's smartest upgrade</p>
                <h1 className="text-9xl font-bold">TimeNest</h1>
            </div>
            <div className="flex flex-row gap-4 w-full items-center justify-center h-16">
                <input className="input input-accent h-full w-[20%] text-xl" type="text" placeholder="Search for public events..."/>
                <h2 className="text-xl">or</h2>
                <button onClick={() => toggleAuth(true)} className="btn btn-primary btn-lg h-full w-[20%]">Sign up for a free account</button>
            </div>
            <div className="flex flex-row gap-4 w-full items-center justify-center">
                <p className="text-xl">Already a member?</p>
                <button onClick={() => toggleAuth(false)} className="btn btn-accent btn-outline btn-lg">Sign in</button>
            </div>
            <AuthModal isNew={isNew} visible={modalKey === ModalKeys.AUTH}></AuthModal>
        </div>
    )
}

export default HomePage;
