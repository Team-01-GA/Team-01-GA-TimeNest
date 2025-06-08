import { motion, type TargetAndTransition } from 'framer-motion';

type Direction = "up" | "down" | "left" | "right";

export default function AnimatedPage({
    children,
    direction = "up"
}: {
    children: React.ReactNode,
    direction?: Direction
}) {
    const initial = { opacity: 0 } as TargetAndTransition;
    const exit = { opacity: 0 } as TargetAndTransition;

    switch (direction) {
        case "down":
            initial.y = -50;
            exit.y = 50;
            break;
        case "left":
            initial.x = 50;
            exit.x = -50;
            break;
        case "right":
            initial.x = -50;
            exit.x = 50;
            break;
        case "up":
        default:
            initial.y = 50;
            exit.y = -50;
            break;
    }

    return (
        <motion.div
            className='w-full h-full'
            initial={initial}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={exit}
            transition={{ duration: 0.3 }}
        >
            {children}
        </motion.div>
    );
}