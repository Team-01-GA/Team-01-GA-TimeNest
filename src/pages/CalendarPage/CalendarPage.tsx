import { useState } from 'react';
import MonthView from '../../components/calendar/MonthView';
import Sidebar from '../../components/calendar/Sidebar';
import AnimatedOutlet from '../../components/AnimatedOutlet';
import { CalendarTypes } from '../../constants/calendar.constants';
import AnimatedPage from '../../components/AnimatedPage';
import WeekView from '../../components/calendar/WeekView';

type CalendarProps = {
    calendarType: CalendarTypes;
};

function CalendarPage({ calendarType }: CalendarProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    return (
        <>
            <div className="flex justify-center items-center p-4 md:p-8">
                <div className="flex w-full gap-6 h-[calc(100vh-10rem)]">
                    {/* MonthView */}
                    {calendarType === CalendarTypes.MONTH && (
                        <AnimatedPage>
                            <div className="flex-1 min-w-0 h-full overflow-hidden">
                                <MonthView
                                    selectedDate={selectedDate}
                                    setSelectedDate={setSelectedDate}
                                />
                            </div>
                        </AnimatedPage>
                    )}

                    {calendarType === CalendarTypes.WEEK && (
                        <AnimatedPage>
                            <div className="flex-1 min-w-0 h-full overflow-hidden">
                                <WeekView
                                    selectedDate={selectedDate}
                                    setSelectedDate={setSelectedDate}
                                />
                            </div>
                        </AnimatedPage>
                    )}

                    {/* Sidebar */}
                    <aside className="w-64 md:w-72 lg:w-80 bg-base-300 p-4 rounded-2xl h-full overflow-hidden">
                        <Sidebar selectedDate={selectedDate} />
                    </aside>
                </div>
            </div>
            <AnimatedOutlet />
        </>
    );
}

export default CalendarPage;
