import { useContext, useEffect, useState, type CSSProperties } from "react";
import { CalendarTypes } from "../../constants/calendar.constants";
import UserContext from "../../providers/UserContext";
import { Icons } from "../../constants/icon.constants";
import { useNavigate } from "react-router-dom";
import DropdownContext from "../../providers/DropdownContext";
import Dropdown from "../Dropdown/Dropdown";
import { DropdownTypes } from "../../constants/dropdown.constants";
import { logoutUser } from "../../services/auth.service";
import ThemeSwitcher from "../ThemeSwitcher/ThemeSwitcher";
import SearchBox from "./SearchBox";

type HeaderProps = {
    calendarType: CalendarTypes;
    setCalendarType: React.Dispatch<React.SetStateAction<CalendarTypes>>;
}

function Header({ calendarType, setCalendarType }: HeaderProps) {

    const { userData } = useContext(UserContext);
    const { openDropdown } = useContext(DropdownContext);
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
        <nav className="fixed z-40 top-0 left-0 flex flex-row justify-between items-center w-full h-24 bg-base-200 bg-gradient-to-b">
            <div className="flex flex-row gap-8 w-[35%] p-4 ml-16 h-full">
                <h1 className="w-fit text-6xl text-base-content font-bold">TimeNest</h1>
                <SearchBox />
            </div>
            <div className="absolute top-1/2 left-1/2 transform translate-x-[-50%] translate-y-[-50%] flex flex-row items-center w-fit pt-2 pr-6 pb-2 pl-6 rounded-2xl bg-base-100">
                <button className="bg-secondary rounded-box text-2xl absolute top-1/2 transform translate-y-[-50%] w-24 p-1 m-0 text-transparent z-0 pointer-events-none" style={higlighterStyles} disabled>
                    {calendarType === CalendarTypes.WEEK && 'Week'}
                    {calendarType === CalendarTypes.MONTH && 'Month'}
                    {calendarType === CalendarTypes.YEAR && 'Year'}
                </button>
                <button onClick={() => setCalendarType(CalendarTypes.WEEK)} className="btn w-24 p-0 m-0 z-10 bg-transparent border-none text-xl text-base-content cursor-pointer">Week</button>
                <button onClick={() => setCalendarType(CalendarTypes.MONTH)} className="btn w-24 p-0 m-0 z-10 bg-transparent border-none text-xl text-base-content cursor-pointer">Month</button>
                <button onClick={() => setCalendarType(CalendarTypes.YEAR)} className="btn w-24 p-0 m-0 z-10 bg-transparent border-none text-xl text-base-content cursor-pointer">Year</button>
            </div>
            <div onClick={(e) => openDropdown(DropdownTypes.PROFILE_MODAL, e)} className="flex flex-row mr-16 items-center p-4 pt-2 pb-2 rounded-box bg-transparent transition-all cursor-pointer hover:bg-base-300">
                <p className="text-2xl mr-4 cursor-pointer">{userData?.handle}</p>
                {userPicture 
                    ? <img className="w-14 h-14 rounded-full cursor-pointer" src={userPicture} alt="Profile picture"/>
                    : <div className="flex flex-row justify-center items-center w-14 h-14 rounded-full bg-primary cursor-pointer">
                        <i className={`${Icons.USER_DEFAULT_PIC} text-xl text-primary-content p-0 m-0 cursor-pointer`}></i>
                    </div>
                }
                <div onClick={(e) => e.stopPropagation()}>
                    <Dropdown keyToOpen={DropdownTypes.PROFILE_MODAL} clickCloses={true}>
                        <div className="flex flex-col gap-4 max-w-[300px] h-max">
                            <button onClick={() => navigate(`/app/account/${userData?.handle}`)} className="btn btn-lg btn-neutral btn-outline w-full justify-start">My Account</button>
                            <div className="flex flex-row items-center w-full gap-8 pr-4">
                                <button onClick={logoutUser} className="btn btn-lg btn-error btn-outline justify-start">Logout</button>
                                <ThemeSwitcher home={false} />
                            </div>
                        </div>
                    </Dropdown>
                </div>
            </div>
        </nav>
    );
}

export default Header;