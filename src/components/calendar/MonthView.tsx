import DayCell from './DayCell';
import { getMonthStartForCalendarGrid, isSameCalendarDay } from '../../utils/calendar.utils';
import { WEEKDAY_LABELS } from '../../constants/calendar.constants';
import { Icons } from '../../constants/icon.constants';
import { useNavigate } from 'react-router-dom';
import type { EventData } from '../../services/events.service';

type MonthViewProps = {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    visibleDate: Date;
    setVisibleDate: React.Dispatch<React.SetStateAction<Date>>;
    events: EventData[];
};

function MonthView({ selectedDate, setSelectedDate, visibleDate, setVisibleDate, events }: MonthViewProps) {
    const navigate = useNavigate();

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
            <div className="relative flex items-center justify-between w-full pl-6 pr-6 mb-4 gap-4 shrink-0">
                <div className='flex items-center justify-start gap-4'>
                    <div className='flex gap-4 absolute top-1/2 left-1/2 transform translate-y-[-50%] translate-x-[-50%]'>
                        <button className="btn btn-xl" onClick={goToPreviousMonth}>←</button>
                        <button className="btn btn-xl" onClick={goToNextMonth}>→</button>
                    </div>
                    <h2 className="text-6xl font-semibold">
                        {visibleDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h2>
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
                        allEvents={events}
                    />
                ))}
            </div>
        </div>
    );
}

export default MonthView;