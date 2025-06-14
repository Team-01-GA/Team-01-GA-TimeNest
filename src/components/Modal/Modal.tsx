import React, { forwardRef } from "react";
import type { Icons } from "../../constants/icon.constants";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from 'framer-motion';

type ModalProps = {
    title: string,
    width: string,
    icon?: Icons | null,
    className?: string,
    children: React.ReactNode,
};

const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal({ title, width, icon, className, children }, ref) {
    const navigate = useNavigate();
    const location = useLocation();

    const closeModal = (): void => {
        if (location.pathname.includes('welcome')) {
            navigate('/welcome');
        } else if (location.pathname.includes('app')) {
            navigate('/app');
        } else {
            navigate(-1);
        }
    };

    return (
        <motion.div
            className="bg-[rgba(109,109,109,0.44)] fixed top-0 left-0 w-[100vw] h-[100vh] z-40 flex flex-col items-center justify-center backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div onClick={closeModal} className='fixed top-0 left-0 w-[100vw] h-[100vh] z-40 flex flex-col items-center justify-center'>
                <div
                    onClick={(e) => e.stopPropagation()}
                    ref={ref}
                    className={`relative flex flex-col p-4 max-h-[60%] bg-base-100 rounded-box shadow-2xl shadow-base-300 outline-primary ${className}`}
                    style={{ width }}
                >
                    <div className="absolute z-[4] flex top-0 left-0 w-[calc(100%-2rem)] mr-8 h-20 bg-base-100/60 backdrop-blur-[3px] rounded-2xl">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.h3
                                key={title}
                                className="text-base-content text-4xl self-center w-[calc(100%-2rem)] ml-8 text-center font-bold bg-transparent"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {icon && <i className={`${icon} mr-4`}></i>}{title}
                            </motion.h3>
                        </AnimatePresence>
                    </div>
                    <div className="w-full h-auto overflow-y-auto p-4 pt-16">
                        {children}
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

export default Modal;