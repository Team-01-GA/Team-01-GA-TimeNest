import { useContext, useEffect, useState, type CSSProperties } from "react";
import { CalendarTypes } from "../../constants/calendar.constants";
import UserContext from "../../providers/UserContext";
import { Icons } from "../../constants/icon.constants";
import { useNavigate } from "react-router-dom";

type HeaderProps = {
    calendarType: CalendarTypes;
    setCalendarType: React.Dispatch<React.SetStateAction<CalendarTypes>>;
}

function Header({ calendarType, setCalendarType }: HeaderProps) {

    const { userData } = useContext(UserContext);
    const [userPicture, setUserPicture] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (userData) {
            setUserPicture(userData?.profileImg ?? null);
        }
    }, [userData])

    const higlighterStyles: CSSProperties = {
        left: calendarType === CalendarTypes.WEEK
            ? '1.5rem'
            : calendarType === CalendarTypes.MONTH
                ? 'calc(6rem + 1.5rem)'
                : 'calc(12rem + 1.5rem)',
        transition: 'all 0.3s ease'
    }

    return (
        <nav className="fixed top-0 left-0 flex flex-row justify-between items-center w-full h-24 bg-base-200 bg-gradient-to-b">
            <h1 className="w-fit text-6xl text-base-content font-bold ml-16">TimeNest</h1>
            <div className="absolute top-1/2 left-1/2 transform translate-x-[-50%] translate-y-[-50%] flex flex-row items-center w-fit pt-2 pr-6 pb-2 pl-6 rounded-2xl bg-base-100">
                <button className="bg-primary rounded-box text-2xl absolute top-1/2 transform translate-y-[-50%] w-24 p-1 m-0 text-transparent opacity-50 z-0 pointer-events-none" style={higlighterStyles} disabled>
                    {calendarType === CalendarTypes.WEEK && 'Week'}
                    {calendarType === CalendarTypes.MONTH && 'Month'}
                    {calendarType === CalendarTypes.YEAR && 'Year'}
                </button>
                <button onClick={() => setCalendarType(CalendarTypes.WEEK)} className="btn w-24 p-0 m-0 z-10 bg-transparent border-none text-xl text-base-content cursor-pointer">Week</button>
                <button onClick={() => setCalendarType(CalendarTypes.MONTH)} className="btn w-24 p-0 m-0 z-10 bg-transparent border-none text-xl text-base-content cursor-pointer">Month</button>
                <button onClick={() => setCalendarType(CalendarTypes.YEAR)} className="btn w-24 p-0 m-0 z-10 bg-transparent border-none text-xl text-base-content cursor-pointer">Year</button>
            </div>
            <div className="flex flex-row mr-16">
                {userPicture 
                    ? <img onClick={() => navigate(`/app/account/${userData?.handle}`)} className="w-12 h-12 rounded-[50%] cursor-pointer" src={userPicture} alt="Profile picture"/>
                    : <div onClick={() => navigate(`/app/account/${userData?.handle}`)} className="flex flex-row justify-center items-center w-12 h-12 rounded-[50%] bg-primary cursor-pointer">
                        <i className={`${Icons.USER_DEFAULT_PIC} text-xl text-primary-content p-0 m-0`}></i>
                    </div>
                }
            </div>
        </nav>
    );
}

export default Header;