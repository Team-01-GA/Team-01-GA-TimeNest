import { motion } from "framer-motion";

function Loader() {
    return (
        <motion.div
            className="fixed w-full h-full flex flex-row items-center justify-center bg-base-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
                duration: 0.4,
                exit: { duration: 0.4, delay: 1 }
            }}
        >
            <div className="loader"></div>
        </motion.div>
    );
}

export default Loader;