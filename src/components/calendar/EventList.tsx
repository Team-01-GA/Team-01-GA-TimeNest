import { useContext, useEffect, useState } from 'react';
import { getUserEventsForDate, type EventData } from '../../services/events.service';
import UserContext from '../../providers/UserContext';
import { useNavigate } from 'react-router-dom';

type EventListProps = {
    selectedDate: Date;
};

function EventList({ selectedDate }: EventListProps) {
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const { userData } = useContext(UserContext);
    
    useEffect(() => {
        async function fetchEvents() {
            if (!userData?.handle) return;

            setLoading(true);
            try {
                const filtered = await getUserEventsForDate(userData.handle, selectedDate);

                filtered.sort((a, b) => {
                    const aDate = new Date(a.start);
                    const bDate = new Date(b.start);
                    const aMinutes = aDate.getHours() * 60 + aDate.getMinutes();
                    const bMinutes = bDate.getHours() * 60 + bDate.getMinutes();
                    return aMinutes - bMinutes;
                });

                setEvents(filtered);
            } catch (e) {
                console.error('Failed to fetch events:', e);
            } finally {
                setLoading(false);
            }
        }

        fetchEvents();
    }, [selectedDate, userData?.handle]);

    // if (loading) return <p className="p-2">Loading events...</p>;
    if (loading) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="loader"></div>
            </div>
        );
    }

    if (events.length === 0) return <p className="p-2 text-sm">No events for this day.</p>;

    return (
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {events.map((event) => (
                <div
                    key={event.id}
                    className="flex flex-row gap-4 bg-primary w-full h-fit p-4 rounded-box cursor-pointer hover:brightness-90"
                    onClick={() => navigate(`/app/event/${event.id}`)}
                >
                    <div className="w-2 min-h-full justify-self-stretch bg-primary-content rounded-box"></div>
                    <div className="relative flex flex-col gap-2 w-full p-2">
                        <p className="text-xl text-primary-content font-bold">{event.title}</p>
                        <p className="text-lg text-primary-content/80">
                            {new Date(event.start).toLocaleDateString()}
                            {' '}
                            {new Date(event.start).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                            {' '}-{' '}
                            {new Date(event.end).toLocaleDateString()}
                            {' '}
                            {new Date(event.end).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                        <p className="text-lg text-primary-content/80">{event.location}</p>
                        {event.createdBy !== userData?.handle && (
                            <p
                                onClick={e => {
                                    e.stopPropagation();
                                    navigate(`/app/account/${event.createdBy}`);
                                }}
                                className="absolute bottom-0 right-0 text-md text-primary-content/80 p-2 rounded-box transition-all hover:bg-neutral hover:text-neutral-content"
                            >
                                Created by {event.createdBy}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default EventList;