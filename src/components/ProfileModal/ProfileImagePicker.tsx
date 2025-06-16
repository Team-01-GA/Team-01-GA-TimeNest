import React, { useContext, useEffect, useRef, useState } from "react";
import UserContext from "../../providers/UserContext";
import { getProfileImageUrl, removeProfileImage, uploadProfileImage } from "../../services/users.service";
import AlertContext from "../../providers/AlertContext";
import { AlertTypes } from "../../constants/alert.constants";
import Dropdown from "../Dropdown/Dropdown";
import { DropdownTypes } from "../../constants/dropdown.constants";
import DropdownContext from "../../providers/DropdownContext";


function ProfileImagePicker ({ setChangeProfilePic }: { setChangeProfilePic: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [hasAccPic, setHasAccPic] = useState<boolean>(false);
    const [currentProfilePicUrl, setCurrentProfilePicUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null); // <-- Store file here
    const inputRef = useRef<HTMLInputElement>(null);

    const { userData, setUserData } = useContext(UserContext);
    const { showAlert } = useContext(AlertContext);
    const { openDropdown } = useContext(DropdownContext);

    useEffect(() => {
        if (userData) {
            const getUserDetails = async () => {
                try {
                    const url = await getProfileImageUrl(userData.handle);
                    
                    if (url) {
                        setPreview(url);
                        setCurrentProfilePicUrl(url);
                        setHasAccPic(true);
                        setSelectedFile(null);
                    }
                }
                catch (error) {
                    console.error('Failed getting current profile picture: ', error);
                }
            }

            getUserDetails();
        }
    }, [userData])

    const handleFiles = (files: FileList | null) => {
        if (files && files[0]) {
            setHasAccPic(false);
            const file = files[0];
            setPreview(URL.createObjectURL(file));
            setSelectedFile(file);
        }
    };

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!preview) {
            if (e.type === "dragenter" || e.type === "dragover") {
                setDragActive(true);
            } else if (e.type === "dragleave") {
                setDragActive(false);
            }
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!preview) {
            setDragActive(false);
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
    };

    const handleRemove = async () => {
        if (userData) {
            try {
                const result = await removeProfileImage(userData);
                if (result) {
                    showAlert(AlertTypes.SUCCESS, 'Profile picture removed.');
                    setPreview(null);
                    setHasAccPic(false);
                    setSelectedFile(null);
                    setUserData({ ...userData, profileImg: undefined });
                }
            }
            catch (error) {
                console.error('Failed removing profile picture: ', error);
            }
        }
    }

    const handleUpload = async () => {
        if (userData && selectedFile) {
            try {
                const url = await uploadProfileImage(userData, selectedFile);
                if (url) {
                    showAlert(AlertTypes.SUCCESS, 'Profile picture uploaded.');
                    setPreview(url);
                    setHasAccPic(true);
                    setSelectedFile(null);
                    setChangeProfilePic(false);
                    setUserData({ ...userData, profileImg: url });
                } else {
                    showAlert(AlertTypes.ERROR, 'Failed to upload profile picture.');
                }
            } catch (error) {
                console.error('Failed uploading profile picture: ', error);
            }
        }
    }

    return (
        <>
            <div
                className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-box w-[70%] h-56 transition-all group ${dragActive ? "border-base-300 bg-base-100" : "border-neutral hover:bg-primary hover:border-primary cursor-pointer"} ${preview ? 'cursor-auto' : ''}`}
                onClick={() => inputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleChange}
                />
                {preview ? (
                    <>
                        <img src={preview} alt="Preview" className="w-full h-full rounded-box object-contain bg-neutral" />
                        {preview && 
                            <div className="absolute bottom-4 left-0 w-full flex flex-row justify-between">
                                <button onClick={(e) => {
                                    e.stopPropagation();
                                    if (hasAccPic) {
                                        openDropdown(DropdownTypes.REMOVE_PROFILE_PIC, e);
                                    } else if (currentProfilePicUrl) {
                                        setPreview(currentProfilePicUrl);
                                        setHasAccPic(true);
                                        setSelectedFile(null);
                                    } else {
                                        setPreview(null);
                                        setHasAccPic(false);
                                        setSelectedFile(null);
                                    }
                                }} 
                                className="btn btn-error btn-outline btn-lg bg-base-100/70 ml-4 text-base-content hover:bg-error hover:text-error-content">
                                    Remove
                                </button>
                                <button onClick={(e) => {
                                    e.stopPropagation();
                                    inputRef.current?.click();
                                }} 
                                className="btn btn-neutral btn-outline btn-lg bg-base-100/70 mr-4 text-base-content hover:bg-base-100">
                                    Change
                                </button>
                            </div>
                        }
                        <div onClick={(e) => e.stopPropagation()}>
                            <Dropdown title="Remove current profile picture?" keyToOpen={DropdownTypes.REMOVE_PROFILE_PIC} clickCloses={true}>
                                <div className="flex flex-col w-full gap-4">
                                    <button onClick={handleRemove} className="btn btn-error btn-lg">Confirm</button>
                                    <button className="btn btn-neutral btn-lg">Cancel</button>
                                </div>  
                            </Dropdown>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center">
                        <span className={`text-xl text-base-content transition-all group-hover:text-primary-content ${dragActive ? 'text-primary-content' : ''}`}>Drag & drop an image here, or click to select</span>
                    </div>
                )}
            </div>
            {!hasAccPic && preview && selectedFile &&
                <button className="btn btn-success btn-lg w-[70%]" onClick={handleUpload}>Upload</button>
            }
        </>
    );
};

export default ProfileImagePicker;