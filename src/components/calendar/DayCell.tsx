type DayCellProps = {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    onClick?: (date: Date) => void;
};

function DayCell({ date, isCurrentMonth, isToday, onClick }: DayCellProps) {
    const baseStyle =
        'aspect-square p-2 border rounded cursor-pointer hover:bg-base-200 transition-all flex items-center justify-center';
    const monthStyle = isCurrentMonth ? '' : ' opacity-50';
    const todayStyle = isToday ? ' bg-primary text-white font-bold' : '';
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const weekendStyle = isWeekend ? ' text-red-500' : '';

    return (
        <div
            className={`${baseStyle}${monthStyle}${todayStyle}${weekendStyle}`}
            onClick={() => onClick?.(date)}
        >
            {date.getDate()}
        </div>
    );
}

export default DayCell;