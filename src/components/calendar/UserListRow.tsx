import { useEffect, useState } from "react";
import { getProfileImageUrl } from "../../services/users.service";
import { Icons } from "../../constants/icon.constants";
import { useNavigate } from "react-router-dom";

function UserListRow({ handle }: { handle: string }) {

    const [profileImg, setProfileImg] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleGoToAccount = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/app/account/${handle}`);
    }

    useEffect(() => {
        const getUserDetails = async () => {
            const url = await getProfileImageUrl(handle);
            setProfileImg(url);
        }

        getUserDetails();
    }, [handle]);

    return (
        <div onClick={(e) => handleGoToAccount(e)} className="flex flex-row gap-3 w-full p-2 pl-3 items-center cursor-pointer rounded-box border border-primary-content transition-all hover:bg-secondary hover:border-transparent group">
            {profileImg 
                ? <img className="w-8 h-8 rounded-[50%]" src={profileImg} alt="Profile picture"/>
                : <div className="flex flex-row justify-center items-center w-8 h-8 rounded-[50%] bg-primary-content shadow">
                    <i className={`${Icons.USER_DEFAULT_PIC} text-xl text-primary p-0 m-0`}></i>
                </div>
            }
            <p className="text-xl text-primary-content transition-all group-hover:text-secondary-content">{handle}</p>
        </div>
    );
}

export default UserListRow;
