import { useEffect, useState } from 'react';
import { getAllEvents, type EventData } from '../../services/events.service';
import { getStartOfWeek, isSameCalendarDay, addDays } from '../../utils/calendar.utils';

type WeekViewProps = {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
};

function WeekView({ selectedDate, setSelectedDate }: WeekViewProps) {
    const [events, setEvents] = useState<EventData[]>([]);
    const [startOfWeek, setStartOfWeek] = useState(getStartOfWeek(selectedDate));

    useEffect(() => {
        setStartOfWeek(getStartOfWeek(selectedDate));
    }, [selectedDate]);

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const days = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i));

    useEffect(() => {
        async function fetchEvents() {
            try {
                const all = await getAllEvents();
                setEvents(all);
            } catch (err) {
                console.error('Failed to fetch events for week view', err);
            }
        }
        fetchEvents();
    }, []); // Only fetch once like MonthView

    function getEventsForDayAndHour(day: Date, hour: number): EventData[] {
        return events.filter((event) => {
            const start = new Date(event.start);
            const end = new Date(event.end);

            // First check if this event occurs on this day using the same logic as DayCell
            const eventOccursOnDay = (() => {
                // Check if it's the same day as the event start
                if (isSameCalendarDay(start, day)) return true;

                // Check if it's a multi-day event that spans this day
                if (start <= day && end >= day) return true;

                // Check recurring events
                if (event.recurrence && event.recurrence.length > 0 && start <= day) {
                    const dayName = day.toLocaleString('en-US', { weekday: 'long' });

                    // Weekly recurrence
                    if (event.recurrence.includes(dayName)) {
                        return true;
                    }

                    // Monthly recurrence
                    if (event.recurrence.includes('Monthly')) {
                        const recurringDay = new Date(event.start).getDate();
                        return day.getDate() === recurringDay;
                    }
                }

                return false;
            })();

            if (!eventOccursOnDay) return false;

            // Now check if the event occurs during this specific hour
            let eventStart, eventEnd;

            if (event.recurrence && event.recurrence.length > 0 && !isSameCalendarDay(start, day)) {
                // For recurring events on different days, calculate the instance time
                eventStart = new Date(day);
                eventStart.setHours(start.getHours(), start.getMinutes(), start.getSeconds(), start.getMilliseconds());

                const eventDurationMs = end.getTime() - start.getTime();
                eventEnd = new Date(eventStart.getTime() + eventDurationMs);
            } else {
                // For original events or multi-day events, use the original times
                eventStart = start;
                eventEnd = end;
            }

            // Check if this event overlaps with the current hour
            const eventStartHour = eventStart.getHours();
            const eventEndHour = eventEnd.getHours();
            const eventEndMinutes = eventEnd.getMinutes();

            // Event overlaps with this hour if:
            // 1. Event starts in this hour, OR
            // 2. Event ends in this hour (but not at exactly hour:00), OR
            // 3. Event spans across this hour
            return (eventStartHour === hour) ||
                (eventEndHour === hour && eventEndMinutes > 0) ||
                (eventStartHour < hour && eventEndHour > hour);
        });
    }

    function goPrevWeek() {
        setStartOfWeek(addDays(startOfWeek, -7));
    }

    function goNextWeek() {
        setStartOfWeek(addDays(startOfWeek, 7));
    }

    return (
        <div className="flex flex-col w-full h-full overflow-y-auto">
            <div className="flex flex-col items-center mb-4">
                <div className="flex justify-between items-center w-full px-4 mb-2">
                    <button className="btn btn-sm" onClick={goPrevWeek}>←</button>
                    <h2 className="text-lg font-bold text-center">
                        Week of {startOfWeek.toLocaleDateString('en-GB')}
                    </h2>
                    <button className="btn btn-sm" onClick={goNextWeek}>→</button>
                </div>

                <button
                    className="btn btn-sm btn-outline mt-2"
                    onClick={() => {
                        const today = new Date();
                        setSelectedDate(today);
                        setStartOfWeek(getStartOfWeek(today));
                    }}
                >
                    Current Week
                </button>
            </div>

            <div className="grid grid-cols-8 w-full border-t border-l text-sm min-w-[900px]">
                {/* Top Row: Time + Weekdays */}
                <div className="bg-base-200 border-r border-b h-10 flex items-center justify-center font-semibold">Time</div>
                {days.map((day, i) => (
                    <button
                        key={i}
                        onClick={() => setSelectedDate(day)}
                        className={`bg-base-200 border-r border-b h-10 flex items-center justify-center font-semibold w-full ${isSameCalendarDay(day, selectedDate) ? 'bg-primary text-white' : ''}`}
                    >
                        {day.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })}
                    </button>
                ))}

                {/* Hour rows */}
                {hours.map((hour) => (
                    <>
                        <div key={`label-${hour}`} className="border-r border-b h-24 flex items-center justify-center text-xs">
                            {hour.toString().padStart(2, '0')}:00
                        </div>
                        {days.map((day, i) => {
                            const cellEvents = getEventsForDayAndHour(day, hour);
                            const isSelected = isSameCalendarDay(day, selectedDate);

                            return (
                                <div
                                    key={`cell-${hour}-${i}`}
                                    className={`border-r border-b h-24 relative ${isSelected ? 'bg-primary/10' : ''}`}
                                >
                                    {cellEvents.map((event, j) => {
                                        const originalStart = new Date(event.start);
                                        const originalEnd = new Date(event.end);

                                        let eventStart, eventEnd;

                                        // Calculate the actual start and end times for this instance
                                        if (event.recurrence && event.recurrence.length > 0 && !isSameCalendarDay(originalStart, day)) {
                                            // For recurring events on different days, calculate the instance time
                                            eventStart = new Date(day);
                                            eventStart.setHours(originalStart.getHours(), originalStart.getMinutes(), originalStart.getSeconds(), originalStart.getMilliseconds());

                                            const eventDurationMs = originalEnd.getTime() - originalStart.getTime();
                                            eventEnd = new Date(eventStart.getTime() + eventDurationMs);
                                        } else {
                                            // For original events or multi-day events, use the original times
                                            eventStart = originalStart;
                                            eventEnd = originalEnd;
                                        }

                                        const durationMinutes = (eventEnd.getTime() - eventStart.getTime()) / 60000;

                                        const startMinutes = eventStart.getHours() * 60 + eventStart.getMinutes();
                                        const hourStart = hour * 60;
                                        const topOffset = Math.max(0, startMinutes - hourStart);
                                        const height = Math.min(durationMinutes, 60 - topOffset);

                                        return (
                                            <div
                                                key={j}
                                                title={event.title}
                                                className="absolute left-1 right-1 bg-accent text-accent-content text-xs px-1 py-0.5 rounded overflow-hidden"
                                                style={{
                                                    top: `${(topOffset / 60) * 100}%`,
                                                    height: `${Math.max((height / 60) * 100, 25)}%`,
                                                    minHeight: '1.25rem',
                                                    lineHeight: '1rem',
                                                }}
                                            >
                                                {event.title}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </>
                ))}
            </div>
        </div>
    );
}

export default WeekView;