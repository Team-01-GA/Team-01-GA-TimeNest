import type { ModalIcons } from "../../constants/modal.constants";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';

type ModalProps = {
    title: string,
    width: string,
    icon: ModalIcons | null,
    children: React.ReactNode,
}

function Modal({ title, width, icon, children }: ModalProps) {

    const navigate = useNavigate();

    const closeModal = (): void => {
        navigate(-1);
    }

    return (
        <motion.div
            className="z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div onClick={closeModal} className='bg-[rgba(109,109,109,0.44)] fixed top-0 left-0 w-[100vw] h-[100vh] z-50 flex flex-col items-center justify-center backdrop-blur-xs'>
                <div onClick={(e) => e.stopPropagation()} className='relative flex flex-col p-4 max-h-1/2 bg-base-100 rounded-box shadow-2xl shadow-base-300' style={{width}}>
                    <div className="absolute z-10 flex top-0 left-0 w-[calc(100%-2rem)] mr-8 h-20 bg-transparent backdrop-blur-[2px] rounded-2xl">
                        <h3 className="text-base-content text-4xl self-center w-[calc(100%-2rem)] ml-8 text-center font-bold bg-transparent">{icon && <i className={`${icon} mr-4`}></i>}{title}</h3>
                    </div>
                    <div className="w-full h-auto overflow-y-auto p-4 pt-20">
                        {children}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default Modal;