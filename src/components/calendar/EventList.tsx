import { useEffect, useState } from 'react';
import { getEventsForDate, type EventData } from '../../services/events.service';
import { useNavigate } from 'react-router-dom';

type EventListProps = {
    selectedDate: Date;
};

function EventList({ selectedDate }: EventListProps) {
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

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
            {events.map((event) => {
                // Determine background color based on event type
                let bgColor = 'bg-primary'; // Default for single day
                if (event.isMultiDay) {
                    bgColor = 'bg-secondary';
                } else if (event.recurrence && event.recurrence.length > 0) {
                    bgColor = event.recurrence.includes('Monthly') ? 'bg-info' : 'bg-warning';
                }

                return (
                    <div
                        key={event.id}
                        className={`p-2 ${bgColor} text-primary-content rounded shadow cursor-pointer hover:brightness-90`}
                        onClick={() => navigate(`/app/event/${event.id}`)}
                    >
                        <div className="flex justify-between">
                            <h3 className="font-semibold">{event.title}</h3>
                        </div>
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
                            {event.location && `, ${event.location}`}
                        </p>
                        <div className="flex justify-between mt-1">
                            <p className="text-xs text-primary-content/70">
                                Created by {event.createdBy}
                            </p>
                            <div className="flex gap-1">
                                {event.isMultiDay && (
                                    <span className="text-xs bg-accent text-accent-content px-1 rounded">Multi-day</span>
                                )}
                                {event.recurrence && event.recurrence.length > 0 ? (
                                    <span className="text-xs bg-accent text-accent-content px-1 rounded">
                                        {event.recurrence.includes('Monthly') ? 'Monthly' : 'Weekly'}
                                    </span>
                                ) : !event.isMultiDay && (
                                    <span className="text-xs bg-accent text-accent-content px-1 rounded">Single Day</span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default EventList;