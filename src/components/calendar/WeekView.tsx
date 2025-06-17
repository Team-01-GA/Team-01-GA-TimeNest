import { useEffect, useMemo, useState } from 'react';
import { getStartOfWeek, isSameCalendarDay, addDays } from '../../utils/calendar.utils';
import { Icons } from '../../constants/icon.constants';
import { useNavigate } from 'react-router-dom';
import type { EventData } from '../../services/events.service';

type WeekViewProps = {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    events: EventData[];
};

function WeekView({ selectedDate, setSelectedDate, events }: WeekViewProps) {
    const [startOfWeek, setStartOfWeek] = useState(getStartOfWeek(selectedDate));
    const [showWorkWeekOnly, setShowWorkWeekOnly] = useState(() => {
        return localStorage.getItem('showWorkWeekOnly') === 'true';
    });
    const navigate = useNavigate();

    useEffect(() => {
        setStartOfWeek(getStartOfWeek(selectedDate));
    }, [selectedDate]);

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const days = useMemo(() => {
        const allDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i));
        return showWorkWeekOnly ? allDays.slice(0, 5) : allDays;
    }, [startOfWeek, showWorkWeekOnly]);

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

            // Check if this event should be displayed in the current hour slot
            const eventStartHour = eventStart.getHours();
            const eventEndHour = eventEnd.getHours();
            const eventEndMinutes = eventEnd.getMinutes();

            // Event should be displayed in this hour if:
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
            <div className="sticky top-0 z-10 flex bg-base-300 items-center justify-between w-full pl-6 pr-6 pb-4 gap-4 shrink-0">
                <div className="flex items-center justify-start gap-4">
                    <h2 className="text-6xl font-bold text-center">
                        Week of {startOfWeek.toLocaleDateString('en-GB')}
                    </h2>
                    <button className="btn btn-xl" onClick={goPrevWeek}>←</button>
                    <button className="btn btn-xl" onClick={goNextWeek}>→</button>
                </div>
                <div className='flex items-center justify-start gap-4'>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-base">Work Week</span>
                        <input
                            type="checkbox"
                            className="toggle toggle-md toggle-primary"
                            checked={showWorkWeekOnly}
                            onChange={() => {
                                setShowWorkWeekOnly((prev) => {
                                    const next = !prev;
                                    localStorage.setItem("showWorkWeekOnly", String(next));
                                    return next;
                                });
                            }}
                        />
                    </div>
                    <button
                        className="btn btn-xl"
                        onClick={() => {
                            const today = new Date();
                            setSelectedDate(today);
                            setStartOfWeek(getStartOfWeek(today));
                        }}
                    >
                        Current Week
                    </button>
                    <button
                        className="btn btn-xl btn-accent flex items-center gap-2"
                        onClick={() => navigate('/app/event/create')}
                    >
                        <i className={Icons.ADD}></i>
                    </button>
                </div>

            </div>

            {/* <div className="grid grid-cols-8 w-full border-t border-l text-sm min-w-[900px]"> */}
            <div className={`grid ${showWorkWeekOnly ? 'grid-cols-6' : 'grid-cols-8'} w-full border-l text-sm min-w-[900px]`}>
                {/* Top Row: Time + Weekdays */}
                <div className="sticky top-19 z-10 bg-base-200 border-t border-r border-b h-10 flex items-center justify-center font-semibold">Time</div>
                {days.map((day, i) => (
                    <button
                        key={i}
                        onClick={() => setSelectedDate(day)}
                        className={`sticky top-19 z-10 bg-base-200 border-t border-r border-b h-10 flex items-center justify-center font-semibold w-full ${isSameCalendarDay(day, selectedDate) ? 'bg-primary text-white' : ''} cursor-pointer`}
                    >
                        {day.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })}
                    </button>
                ))}

                {/* Hour rows */}
                {hours.map((hour) => (
                    <div key={`hour-${hour}`} className="contents">
                        <div className="border-r border-b h-24 flex items-center justify-center text-xs">
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

                                        const startMinutes = eventStart.getHours() * 60 + eventStart.getMinutes();
                                        const endMinutes = eventEnd.getHours() * 60 + eventEnd.getMinutes();
                                        const hourStart = hour * 60;
                                        const hourEnd = hourStart + 60;

                                        // Calculate the portion of the event that appears in this hour
                                        const visibleStart = Math.max(startMinutes, hourStart);
                                        const visibleEnd = Math.min(endMinutes, hourEnd);
                                        const visibleDuration = visibleEnd - visibleStart;

                                        const topOffset = visibleStart - hourStart;
                                        const height = visibleDuration;

                                        // Determine if this cell should show the event title
                                        const eventStartHour = eventStart.getHours();
                                        const eventEndHour = eventEnd.getHours();
                                        const eventSpanHours = eventEndHour - eventStartHour + (eventEnd.getMinutes() > 0 ? 1 : 0);

                                        // Show title in the middle hour, or first hour if event is short
                                        const titleHour = eventSpanHours <= 2
                                            ? eventStartHour
                                            : eventStartHour + Math.floor(eventSpanHours / 2);

                                        const showTitle = hour === titleHour;

                                        // Determine background color based on event type (same as sidebar)
                                        let eventBgColor = 'bg-primary text-primary-content'; // Default for single day
                                        if (event.isMultiDay) {
                                            eventBgColor = 'bg-secondary text-secondary-content';
                                        } else if (event.recurrence && event.recurrence.length > 0) {
                                            eventBgColor = event.recurrence.includes('Monthly')
                                                ? 'bg-info text-info-content'
                                                : 'bg-warning text-warning-content';
                                        }

                                        return (
                                            <div
                                                key={`${event.id ?? `${hour}-${i}-${j}`}`}
                                                title={event.title}
                                                onClick={() => navigate(`/app/event/${event.id}`)}
                                                className={`absolute left-1 right-1 ${eventBgColor} text-xs px-1 py-0.5 overflow-hidden flex items-center justify-center cursor-pointer font-bold`}
                                                style={{
                                                    top: `${(topOffset / 60) * 100}%`,
                                                    height: `${Math.max((height / 60) * 100, 25)}%`,
                                                    minHeight: '1.25rem',
                                                }}
                                            >
                                                {showTitle ? event.title : ''}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default WeekView;