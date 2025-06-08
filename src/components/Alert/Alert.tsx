import { useContext, useEffect, useState, type CSSProperties } from "react";
import AlertContext from "../../providers/AlertContext";
import { AlertIcons } from "../../constants/alert.constants";

function Alert() {

    const { alertType, alertMessage } = useContext(AlertContext);
    const [visible, setVisible] = useState<boolean>(false);
    const [icon, setIcon] = useState<string>('');

    useEffect(() => {
        if (alertType) {
            setVisible(true);
            setIcon(AlertIcons(alertType));
        } else {
            setVisible(false);
            setIcon('');
        }
    }, [alertType]);

    const alertStyle: CSSProperties = {
        transform: "translateY(-50%)",
        left: "50%",
        display: visible
            ? 'flex'
            : 'none',
        animation: 'alert-anim 5s forwards',
    };

    return (
        <div className={`${alertType} alert-vertical fixed max-w-2xl z-50 bottom-0 text-2xl text-start`} style={alertStyle}>
            {icon && <i className={icon}></i>}
            <span>{alertMessage}</span>
        </div>
    );
}

export default Alert;
