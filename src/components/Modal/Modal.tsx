import { useContext, useEffect, useState } from "react";
import ModalContext from "../../providers/ModalContext";

type ModalProps = {
    title: string,
    width: string,
    height: string,
    visibility: boolean,
    children: React.ReactNode,
}

function Modal({ title, width, height, visibility, children }: ModalProps) {

    const [visible, setVisible] = useState<boolean>(false);
    const { closeModal } = useContext(ModalContext);

    useEffect(() => {
        setVisible(visibility);
    }, [visibility]);

    return (
        <div onClick={closeModal} className="bg-[rgba(109,109,109,0.44)] fixed top-0 left-0 w-[100vw] h-[100vh] flex flex-col items-center justify-center backdrop-blur-xs opacity-0 pointer-events-none transition duration-[0.3s] ease" style={{opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none'}}>
            <div onClick={(e) => e.stopPropagation()} className='relative flex flex-col p-1 bg-base-100 rounded-2xl shadow-2xl shadow-base-300' style={{width, height}}>
                <div className="absolute z-10 flex top-0 left-0 w-[calc(100%-1rem)] mr-4 h-20 bg-transparent backdrop-blur-[2px] rounded-2xl">
                    <h3 className="text-base-content text-4xl self-center w-[calc(100%-1rem)] ml-4 text-center font-bold bg-transparent">{title}</h3>
                </div>
                <div className="w-full h-auto overflow-y-auto p-4 pt-20">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Modal;