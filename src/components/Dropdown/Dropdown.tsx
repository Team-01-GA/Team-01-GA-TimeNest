import React, { useRef, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DropdownContext from "../../providers/DropdownContext";
import type { DropdownTypes } from "../../constants/dropdown.constants";

type DialogProps = {
    title?: string;
    keyToOpen: DropdownTypes;
    clickCloses?: boolean;
    children: React.ReactNode;
};

function Dropdown({ title, keyToOpen, clickCloses, children }: DialogProps) {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { dropdownKey, dropdownPosition, closeDropdown } = useContext(DropdownContext);

    const open = dropdownKey === keyToOpen;

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (
                open &&
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                closeDropdown();
            }
        };

        const handleScroll = (e: Event) => {
            if (open && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                closeDropdown();
            }
        };

        if (open) {
            window.addEventListener("mousedown", handleClick);
            window.addEventListener("scroll", handleScroll, true);
        }
        return () => {
            window.removeEventListener("mousedown", handleClick);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [open, closeDropdown]);

    const maxWidth = 400;
    let style: React.CSSProperties = {};
    let clipPathStyle: string = 'inset(0 100% 100% 0 round 1rem)';

    if (dropdownPosition) {
        if (dropdownPosition.left + maxWidth > window.innerWidth) {
            // Use right instead of left
            style = {
                top: dropdownPosition.top,
                right: window.innerWidth - dropdownPosition.left,
                position: "fixed",
                padding: 0,
                border: "none",
                background: "none",
                maxWidth,
            };
            clipPathStyle = 'inset(0 0 100% 100% round 1rem)';
        } else {
            style = {
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                position: "fixed",
                padding: 0,
                border: "none",
                background: "none",
                maxWidth,
            };
            clipPathStyle = 'inset(0 100% 100% 0 round 1rem)';
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    ref={dropdownRef}
                    className="fixed z-40 backdrop-blur-lg rounded-box border-2 border-base-300 shadow-2xl shadow-black/70"
                    style={style}
                    initial={{ opacity: 0, y: -10, x: -10, clipPath: clipPathStyle }}
                    animate={{ opacity: 1, y: 0, x: 0, clipPath: "inset(0% 0% 0% 0% round 1rem)" }}
                    exit={{ opacity: 0, y: 0, x: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                    <div
                        onClick={() => clickCloses && closeDropdown()}
                        className="relative bg-base-300/50 backdrop-blur-lg rounded-box max-w-[400px] max-h-[600px] border-2 border-base-300 drop-shadow-2xl"
                    >
                        {title && <p className="sticky top-0 left-0 w-full rounded-box text-xl text-base-content/80 font-bold p-4 pl-4">{title}</p>}
                        <div className={`w-full max-h-[500px] p-4 overflow-y-auto ${title ? 'pt-1 pb-6' : ''}`}>
                            {children}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default Dropdown;
