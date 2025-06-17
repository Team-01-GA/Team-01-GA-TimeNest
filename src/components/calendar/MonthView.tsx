import { useContext, useState, useEffect } from 'react';
import DayCell from './DayCell';
import { getMonthStartForCalendarGrid, isSameCalendarDay } from '../../utils/calendar.utils';
import { WEEKDAY_LABELS } from '../../constants/calendar.constants';
import { Icons } from '../../constants/icon.constants';
import { useNavigate } from 'react-router-dom';
import { getAllEvents, type EventData } from '../../services/events.service';
import UserContext from '../../providers/UserContext';

type MonthViewProps = {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    visibleDate: Date;
    setVisibleDate: React.Dispatch<React.SetStateAction<Date>>;
};

function MonthView({ selectedDate, setSelectedDate, visibleDate, setVisibleDate }: MonthViewProps) {
    const [allEvents, setAllEvents] = useState<EventData[]>([]);
    const { userData } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        async function loadEvents() {
            if (!userData?.handle) return;
            try {
                const events = await getAllEvents();
                setAllEvents(
                    events.filter(
                        e =>
                            e.createdBy === userData.handle ||
                            (Array.isArray(e.participants) && e.participants.includes(userData.handle))
                    )
                );
            } catch (err) {
                console.error('Failed to fetch events for calendar grid', err);
            }
        }
        loadEvents();
    }, [userData?.handle]);

    function goToPreviousMonth() {
        const prev = new Date(visibleDate);
        prev.setMonth(prev.getMonth() - 1);
        setVisibleDate(prev);
    }

    function goToNextMonth() {
        const next = new Date(visibleDate);
        next.setMonth(next.getMonth() + 1);
        setVisibleDate(next);
    }

    function goToToday() {
        setVisibleDate(new Date());
        setSelectedDate(new Date());
    }

    const start = getMonthStartForCalendarGrid(visibleDate);
    const currentMonth = visibleDate.getMonth();

    const days = [...Array(42)].map((_, i) => {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        return date;
    });

    return (
        <div className="w-full h-full flex flex-col">
            {/* Month Header */}
            <div className="flex items-center justify-between w-full pl-6 pr-6 mb-4 gap-4 shrink-0">
                <div className='flex items-center justify-start gap-4'>
                    <h2 className="text-6xl font-semibold">
                        {visibleDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button className="btn btn-xl" onClick={goToPreviousMonth}>←</button>
                    <button className="btn btn-xl" onClick={goToNextMonth}>→</button>
                </div>
                <div className='flex items-center justify-start gap-4'>
                    <button className='btn btn-xl' onClick={goToToday}>Today</button>
                    <button
                        className="btn btn-xl btn-accent flex items-center gap-2"
                        onClick={() => navigate('/app/event/create')}
                    >
                        <i className={Icons.ADD}></i>
                    </button>
                </div>
            </div>

            {/* Weekday labels */}
            <div className="grid grid-cols-7 mb-2 text-center text-sm font-semibold text-base-content/70 shrink-0">
                {WEEKDAY_LABELS.map((label) => (
                    <div key={label}>{label}</div>
                ))}
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7 gap-2 flex-1">
                {days.map((date) => (
                    <DayCell
                        key={date.toISOString()}
                        date={date}
                        isToday={isSameCalendarDay(date, new Date())}
                        isCurrentMonth={date.getMonth() === currentMonth}
                        onClick={() => setSelectedDate(date)}
                        isSelected={isSameCalendarDay(date, selectedDate)}
                        allEvents={allEvents}
                    />
                ))}
            </div>
        </div>
    );
}

export default MonthView;