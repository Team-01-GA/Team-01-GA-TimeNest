import { useContext } from 'react';
import { type EventData } from '../../services/events.service';
import UserContext from '../../providers/UserContext';
import { useNavigate } from 'react-router-dom';

type EventListProps = {
    selectedDate: Date;
    events: EventData[];
};

function EventList({ selectedDate, events }: EventListProps) {
    const navigate = useNavigate();
    const { userData } = useContext(UserContext);

    // Filter events for the selected date, including daily/weekly/monthly recurring
    const filtered = events.filter(event => {
        const start = new Date(event.start);
        const end = new Date(event.end);
        const isSameDay = (d1: Date, d2: Date) =>
            d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();

        // Daily recurring support
        if (event.recurrence && event.recurrence.includes('Daily') && selectedDate >= start) {
            return true;
        }

        // Weekly/Monthly/other logic
        return (
            isSameDay(start, selectedDate) ||
            (event.isMultiDay && selectedDate >= start && selectedDate <= end) ||
            (
                event.recurrence &&
                selectedDate >= start &&
                (
                    (event.recurrence.includes('Monthly') && selectedDate.getDate() === start.getDate()) ||
                    event.recurrence.includes(selectedDate.toLocaleString('en-US', { weekday: 'long' }))
                )
            )
        );
    });

    if (filtered.length === 0) return <p className="mt-8 text-xl w-full text-center">No events for this day.</p>;

    return (
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filtered.map((event) => (
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