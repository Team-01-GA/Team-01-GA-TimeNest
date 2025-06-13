import { type EventData } from '../../services/events.service';

type DayCellProps = {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected?: boolean;
    onClick?: (date: Date) => void;
    allEvents: EventData[];
};

function DayCell({ date, isCurrentMonth, isToday, isSelected, onClick, allEvents }: DayCellProps) {
    const baseStyle =
        'h-full border rounded cursor-pointer hover:bg-base-200 transition-all flex items-center justify-center';
    const monthStyle = isCurrentMonth ? '' : ' opacity-50';
    const todayStyle = isToday ? ' bg-primary text-white font-bold' : '';
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const weekendStyle = isWeekend ? ' text-red-500' : '';
    const selectedStyle = isSelected ? ' ring-2 ring-primary' : '';

    const eventsForThisDay = allEvents.filter((event) => {
        const start = new Date(event.start);
        const end = new Date(event.end);

        const isSameDay = (d: Date) =>
            d.getDate() === date.getDate() &&
            d.getMonth() === date.getMonth() &&
            d.getFullYear() === date.getFullYear();

        if (isSameDay(start)) return true;
        if (start <= date && end >= date) return true;

        if (event.recurrence && event.recurrence.length > 0 && start <= date) {
            const dayName = date.toLocaleString('en-US', { weekday: 'long' });

            if (event.recurrence.includes(dayName)) {
                return true;
            }

            if (event.recurrence.includes('Monthly')) {
                const recurringDay = new Date(event.start).getDate();
                return date.getDate() === recurringDay;
            }
        }

        return false;
    });

    return (
        <div
            className={`${baseStyle}${monthStyle}${todayStyle}${weekendStyle}${selectedStyle}`}
            onClick={() => onClick?.(date)}
            data-date={date}
        >
            <div className="relative w-full h-full flex items-center justify-center">
                {date.getDate()}
                {eventsForThisDay.length > 0 && (
                    <span className="badge badge-sm badge-accent absolute bottom-1 right-1">
                        {eventsForThisDay.length} events
                    </span>
                )}
            </div>
        </div>
    );
}

export default DayCell;