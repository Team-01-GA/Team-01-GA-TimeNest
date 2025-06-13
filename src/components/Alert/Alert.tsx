import { useContext, useEffect, useRef, useState, type CSSProperties } from "react";
import AlertContext from "../../providers/AlertContext";
import { AlertIcons } from "../../constants/alert.constants";

function Alert() {
    const { alertType, alertMessage } = useContext(AlertContext);
    const [visible, setVisible] = useState<boolean>(false);
    const [icon, setIcon] = useState<string>('');
    const alertRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (alertType) {
            setVisible(true);
            setIcon(AlertIcons(alertType));
        } else {
            setVisible(false);
            setIcon('');
        }
    }, [alertType]);

    useEffect(() => {
        if (alertRef.current) {

            alertRef.current.style.animation = 'none';

            void alertRef.current.offsetWidth;

            alertRef.current.style.animation = 'alert-anim 5s forwards';
        }
    }, [alertType, alertMessage]);

    const alertStyle: CSSProperties = {
        transform: "translateY(-50%)",
        left: "50%",
        opacity: visible ? '1' : '0',
        animation: 'alert-anim 5s forwards',
    };

    return (
        <div ref={alertRef} className={`${alertType} alert-vertical flex fixed max-w-2xl z-50 bottom-0 text-2xl text-start pointer-events-none`} style={alertStyle}>
            {icon && <i className={icon}></i>}
            <span>{alertMessage}</span>
        </div>
    );
}

export default Alert;
