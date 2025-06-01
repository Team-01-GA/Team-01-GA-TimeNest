import { useState } from 'react';
import DayCell from './DayCell';
import { getMonthStartForCalendarGrid, isSameCalendarDay } from '../../utils/calendar.utils';
import { WEEKDAY_LABELS } from '../../constants/calendar.constants';

function MonthView() {
    const [visibleDate, setVisibleDate] = useState(new Date());

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
    }

    const start = getMonthStartForCalendarGrid(visibleDate);
    const currentMonth = visibleDate.getMonth();

    const days = [...Array(42)].map((_, i) => {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        return date;
    });

    return (
        <div className="max-w-screen-md mx-auto">
            {/* Month Header */}
            <div className="flex items-center justify-between mb-2">
                <button className="btn btn-sm" onClick={goToPreviousMonth}>←</button>
                <h2 className="text-lg font-semibold">
                    {visibleDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <button className="btn btn-sm" onClick={goToNextMonth}>→</button>
            </div>

            {/* Today Button */}
            <div className="flex justify-center mb-4">
                <button className="btn btn-xs btn-outline" onClick={goToToday}>
                    Today
                </button>
            </div>

            {/* Weekday labels */}
            <div className="grid grid-cols-7 mb-2 text-center text-sm font-semibold text-base-content/70">
                {WEEKDAY_LABELS.map((label) => (
                    <div key={label}>{label}</div>
                ))}
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7 gap-2">
                {days.map((date) => (
                    <DayCell
                        key={date.toISOString()}
                        date={date}
                        isToday={isSameCalendarDay(date, new Date())}
                        isCurrentMonth={date.getMonth() === currentMonth}
                    />
                ))}
            </div>
        </div>
    );
}

export default MonthView;