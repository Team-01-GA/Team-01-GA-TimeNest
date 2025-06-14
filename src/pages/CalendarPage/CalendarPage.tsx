import { useEffect, useState } from 'react';
import MonthView from '../../components/calendar/MonthView';
import Sidebar from '../../components/calendar/Sidebar';
import AnimatedOutlet from '../../components/AnimatedOutlet';
import { CalendarTypes } from '../../constants/calendar.constants';
import AnimatedPage from '../../components/AnimatedPage';
import WeekView from '../../components/calendar/WeekView';
import { useLocation, type Location } from 'react-router-dom';
import LocationContext from '../../providers/LocationContext';
import YearView from '../../components/calendar/YearView';

type CalendarProps = {
    calendarType: CalendarTypes;
    setCalendarType: React.Dispatch<React.SetStateAction<CalendarTypes>>;
};

function CalendarPage({ calendarType, setCalendarType }: CalendarProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [visibleDate, setVisibleDate] = useState(new Date());

    const [location, setLocation] = useState<Location | null>(null);
    const currentLocation = useLocation();

    useEffect(() => {
        setLocation(currentLocation);
    }, [currentLocation])

    return (
        <>
            <LocationContext.Provider value={{ location }}>
                <div className="flex justify-center items-center p-4 md:p-8">
                    <div className="flex w-full gap-6 h-[calc(100vh-10rem)]">

                        {calendarType === CalendarTypes.YEAR && (
                            <AnimatedPage width='w-[80%]'>
                                <div className="flex-1 min-w-0 h-full overflow-hidden p-4 rounded-box bg-base-300">
                                    <YearView
                                        selectedDate={selectedDate}
                                        setSelectedDate={setSelectedDate}
                                        setCalendarType={setCalendarType}
                                        setVisibleDate={setVisibleDate}
                                    />
                                </div>
                            </AnimatedPage>
                        )}
                        
                        {calendarType === CalendarTypes.MONTH && (
                            <AnimatedPage width='w-[80%]'>
                                <div className="flex-1 min-w-0 h-full overflow-hidden p-4 rounded-box bg-base-300">
                                    <MonthView
                                        selectedDate={selectedDate}
                                        setSelectedDate={setSelectedDate}
                                        visibleDate={visibleDate}
                                        setVisibleDate={setVisibleDate}
                                    />
                                </div>
                            </AnimatedPage>
                        )}

                        {calendarType === CalendarTypes.WEEK && (
                            <AnimatedPage width='w-[80%]'>
                                <div className="flex-1 min-w-0 h-full overflow-hidden p-4 rounded-box bg-base-300">
                                    <WeekView
                                        selectedDate={selectedDate}
                                        setSelectedDate={setSelectedDate}
                                    />
                                </div>
                            </AnimatedPage>
                        )}

                        <aside className="w-[20%] bg-base-300 p-4 rounded-box h-full overflow-hidden">
                            <Sidebar selectedDate={selectedDate} />
                        </aside>
                    </div>
                </div>
                <AnimatedOutlet />
            </LocationContext.Provider>
        </>
    );
}

export default CalendarPage;
