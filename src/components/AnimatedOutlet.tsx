import { AnimatePresence } from 'framer-motion';
import { useOutlet, useLocation } from 'react-router-dom';

const AnimatedOutlet = () => {
  const outlet = useOutlet();
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      {outlet && (
        <div key={location.pathname}>
          {outlet}
        </div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedOutlet;