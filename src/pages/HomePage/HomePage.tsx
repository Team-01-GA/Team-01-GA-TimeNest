import { useEffect, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedOutlet from "../../components/AnimatedOutlet";
import { NewUserContext } from "../../providers/NewUserContext";
import { Icons } from "../../constants/icon.constants";
import { useTheme } from "../../utils/useTheme";
import AnimatedPage from "../../components/AnimatedPage";

function HomePage() {

    const [isNew, setIsNew] = useState<boolean>(true);
    const [darkModeIcon, setDarkModeIcon] = useState<Icons>(Icons.DARK_MODE_SYSTEM);
    const [darkModeIconPosition, setDarkModeIconPosition] = useState<string>('50%');
    const { prefersDark, cycleTheme } = useTheme();
    
    const navigate = useNavigate();

    const toggleAuth = (isNewFlag: boolean) => {
        setIsNew(isNewFlag);
        navigate('/welcome/auth');
    }

    const darkModeIconStyles: CSSProperties = {
        transition: 'all 0.3s ease',
        left: darkModeIconPosition,
        transform: 'translateX(-50%)',
    }

    useEffect(() => {
        setDarkModeIcon(
            prefersDark === false
                ? Icons.LIGHT_MODE
                : prefersDark === null
                    ? Icons.DARK_MODE_SYSTEM
                    : Icons.DARK_MODE
        );
        setDarkModeIconPosition(
            prefersDark === false
                ? '0'
                : prefersDark === null
                    ? '50%'
                    : '100%'
        );
    }, [prefersDark])

    return (
        <>
            <div className="fixed top-8 right-8 w-16 h-4 rounded-box bg-gray-300 group cursor-pointer" onClick={cycleTheme}>
                <i className={`${darkModeIcon} absolute top-1/2 transform translate-y-[-50%] text-lg text-black p-2 bg-primary rounded-box`} style={darkModeIconStyles}></i>
                <p className="absolute left-1/2 bottom-[-300%] transform translate-x-[-50%] rounded-box pl-3 pr-3 m-0 bg-gray-300 text-lg text-black opacity-0 group-hover:opacity-100 transition-all duration-[0.3s] pointer-events-none">
                    {prefersDark === false
                        ? 'Light'
                        : prefersDark === null
                            ? 'System'
                            : 'Dark'
                    }
                </p>
            </div>
            <AnimatedPage>
                <div className="flex flex-col items-center justify-center gap-8 w-full h-full">
                    <div className="flex flex-col">
                        <p className="text-center text-2xl">Your schedule's smartest upgrade</p>
                        <h1 className="text-9xl font-bold">TimeNest</h1>
                    </div>
                    <div className="flex flex-row gap-4 w-full items-center justify-center h-16">
                        <input className="input input-accent h-full w-[20%] text-xl" type="text" placeholder="Search for public events..."/>
                        <h2 className="text-xl">or</h2>
                        <button onClick={() => toggleAuth(true)} className="btn btn-primary btn-lg h-full w-[20%]">Sign up for a free account</button>
                    </div>
                    <div className="flex flex-row gap-4 w-full items-center justify-center">
                        <p className="text-xl">Already a member?</p>
                        <button onClick={() => toggleAuth(false)} className="btn btn-accent btn-outline btn-lg">Sign in</button>
                    </div>
                    <NewUserContext.Provider value={{ isNew }}>
                        <AnimatedOutlet />
                    </NewUserContext.Provider>
                </div>
            </AnimatedPage>
        </>
    )
}

export default HomePage;
