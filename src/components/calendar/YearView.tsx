import { useState } from 'react';
import { CalendarTypes } from '../../constants/calendar.constants';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../../constants/icon.constants';

type YearViewProps = {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    setCalendarType: React.Dispatch<React.SetStateAction<CalendarTypes>>;
    setVisibleDate: React.Dispatch<React.SetStateAction<Date>>;
};

const MONTH_LABELS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function YearView({ selectedDate, setSelectedDate, setCalendarType, setVisibleDate }: YearViewProps) {
    const [visibleYear, setVisibleYear] = useState(selectedDate.getFullYear());
    const [direction, setDirection] = useState<1 | -1 | 0>(0);
    const [yearEdit, setYearEdit] = useState<boolean>(false);
    const [yearInput, setYearInput] = useState(visibleYear.toString());

    const navigate = useNavigate();

    function goToPreviousYear() {
        setDirection(-1);
        setVisibleYear(y => y - 1);
    }

    function goToNextYear() {
        setDirection(1);
        setVisibleYear(y => y + 1);
    }

    function goToToday() {
        if (new Date().getFullYear() < selectedDate.getFullYear()) {
            setDirection(-1);
        } else {
            setDirection(1);
        }
        setVisibleYear(new Date().getFullYear());
        setVisibleDate(new Date());
        setSelectedDate(new Date());
    }

    function handleMonthClick(monthIdx: number) {
        const newDate = new Date(visibleYear, monthIdx, 1);
        setSelectedDate(newDate);
        setVisibleDate(newDate);
        setCalendarType(CalendarTypes.MONTH);
    }

    function handleYearEdit(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            const parsed = parseInt(yearInput, 10);
            if (!isNaN(parsed)) {
                setVisibleYear(parsed);
            }
            setYearEdit(false);
        }
    }

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex items-center justify-between w-full pl-6 pr-6 mb-4 gap-4 shrink-0">
                <div className='flex items-center justify-start gap-4'>
                    {yearEdit 
                        ? <input
                            className='input input-xl'
                            type="number"
                            value={yearInput}
                            onChange={e => setYearInput(e.target.value)}
                            onKeyDown={handleYearEdit}
                            onBlur={() => setYearEdit(false)}
                            autoFocus
                          />
                        : <h2
                            className="text-6xl font-semibold cursor-pointer"
                            onClick={() => {
                                setYearInput(visibleYear.toString());
                                setYearEdit(true);
                            }}
                          >
                            {visibleYear}
                          </h2>
                    }
                    <button className="btn btn-xl" onClick={goToPreviousYear}>←</button>
                    <button className="btn btn-xl" onClick={goToNextYear}>→</button>
                </div>
                <div className='flex items-center justify-start gap-4'>
                    <button className='btn btn-xl' onClick={goToToday}>Current Year</button>
                    <button
                            className="btn btn-xl btn-accent flex items-center gap-2"
                            onClick={() => navigate('/app/event/create')}
                        >
                            <i className={Icons.ADD}></i>
                    </button>
                </div>
            </div>

            <div className="relative flex-1">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={visibleYear}
                        initial={{ x: direction === 1 ? 300 : -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: direction === -1 ? 300 : -300, opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="absolute inset-0 grid grid-cols-3 gap-4"
                    >
                        {MONTH_LABELS.map((label, idx) => (
                            <div
                                key={label}
                                className={`flex flex-col h-full w-full border-2 border-primary rounded-box text-3xl items-center justify-center p-8 transition-all cursor-pointer hover:outline-4 hover:outline-primary ${selectedDate.getFullYear() === visibleYear && selectedDate.getMonth() === idx ? 'border-transparent bg-primary text-primary-content' : ''}`}
                                onClick={() => handleMonthClick(idx)}
                            >
                                {label}
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

export default YearView;