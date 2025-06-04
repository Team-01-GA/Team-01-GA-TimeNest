import { useState } from 'react';
import DayCell from './DayCell';
import { getMonthStartForCalendarGrid, isSameCalendarDay } from '../../utils/calendar.utils';
import { WEEKDAY_LABELS } from '../../constants/calendar.constants';
import { useContext } from 'react';
import ModalContext from '../../providers/ModalContext';
import { ModalKeys, ModalIcons } from '../../constants/modal.constants';

type MonthViewProps = {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
};

function MonthView({ selectedDate, setSelectedDate }: MonthViewProps) {
    const [visibleDate, setVisibleDate] = useState(new Date());
    const { openModal } = useContext(ModalContext);

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
            <div className="flex items-center justify-between mb-2 shrink-0">
                <button className="btn btn-sm" onClick={goToPreviousMonth}>←</button>
                <h2 className="text-lg font-semibold">
                    {visibleDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <button className="btn btn-sm" onClick={goToNextMonth}>→</button>
            </div>

            {/* Today Button
            <div className="flex justify-center mb-4 shrink-0">
                <button className="btn btn-xs btn-outline" onClick={goToToday}>
                    Today
                </button>
            </div> */}

            <div className="flex flex-col items-center gap-2 mb-4 shrink-0">
                <button className="btn btn-xs btn-outline" onClick={goToToday}>
                    Today
                </button>
                <button
                    className="btn btn-sm btn-accent flex items-center gap-2"
                    onClick={() => openModal(ModalKeys.CREATE_EVENT)}
                >
                    <i className={ModalIcons.CREATE_EVENT}></i>
                    Create Event
                </button>
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
                    />
                ))}
            </div>
        </div>
    );
}

export default MonthView;