import { useContext, useEffect, useState } from "react";
import ModalContext from "../../providers/ModalContext";
import type { ModalIcons } from "../../constants/modal.constants";

type ModalProps = {
    title: string,
    width: string,
    visibility: boolean,
    icon: ModalIcons | null,
    children: React.ReactNode,
}

function Modal({ title, width, visibility, icon, children }: ModalProps) {

    const [visible, setVisible] = useState<boolean>(false);
    const { closeModal } = useContext(ModalContext);

    useEffect(() => {
        setVisible(visibility);
    }, [visibility]);

    return (
        <div onClick={closeModal} className="bg-[rgba(109,109,109,0.44)] fixed top-0 left-0 w-[100vw] h-[100vh] flex flex-col items-center justify-center backdrop-blur-xs opacity-0 pointer-events-none transition duration-[0.3s] ease" style={{opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none'}}>
            <div onClick={(e) => e.stopPropagation()} className='relative flex flex-col p-4 max-h-1/2 bg-base-100 rounded-box shadow-2xl shadow-base-300' style={{width}}>
                <div className="absolute z-10 flex top-0 left-0 w-[calc(100%-2rem)] mr-8 h-20 bg-transparent backdrop-blur-[2px] rounded-2xl">
                    <h3 className="text-base-content text-4xl self-center w-[calc(100%-2rem)] ml-8 text-center font-bold bg-transparent">{icon && <i className={`${icon} mr-4`}></i>}{title}</h3>
                </div>
                <div className="w-full h-auto overflow-y-auto p-4 pt-20">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Modal;