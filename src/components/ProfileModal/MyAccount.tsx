import { useContext, useEffect, useState } from "react";
import UserContext, { type UserData } from "../../providers/UserContext";
import { type EventData } from "../../services/events.service";

export type AccountProps = {
    userObject?: UserData | null;
    events: EventData[];
}

function MyAccountDetails({ events }: AccountProps) {

    const { userData } = useContext(UserContext);

    return (
        <div></div>
    );
}

export default MyAccountDetails;
