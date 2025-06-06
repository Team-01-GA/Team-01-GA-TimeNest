import { useEffect, useState } from 'react';
import { getEventsForDate, type EventData } from '../../services/events.service';

type EventListProps = {
    selectedDate: Date;
};

function EventList({ selectedDate }: EventListProps) {
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEvents() {
            setLoading(true);
            try {
                const filtered = await getEventsForDate(selectedDate);

                // this monstrosity sorts by start hour
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
    }, [selectedDate]);

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
                    className="p-2 bg-primary text-primary-content rounded shadow"
                >
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-sm">
                        {new Date(event.start).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}{' '}
                        –{' '}
                        {new Date(event.end).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                        , {event.location || 'No location'}
                    </p>
                    <p className="text-xs text-primary-content/70">
                        Created by {event.createdBy}
                    </p>
                </div>
            ))}
        </div>
    );
}

export default EventList;