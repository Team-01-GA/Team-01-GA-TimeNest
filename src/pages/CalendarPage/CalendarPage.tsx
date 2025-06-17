import { useContext, useEffect, useState } from 'react';
import MonthView from '../../components/calendar/MonthView';
import Sidebar from '../../components/calendar/Sidebar';
import AnimatedOutlet from '../../components/AnimatedOutlet';
import { CalendarTypes } from '../../constants/calendar.constants';
import AnimatedPage from '../../components/AnimatedPage';
import WeekView from '../../components/calendar/WeekView';
import { useLocation, type Location } from 'react-router-dom';
import LocationContext from '../../providers/LocationContext';
import YearView from '../../components/calendar/YearView';
import UserContext from '../../providers/UserContext';
import { db } from '../../config/firebase-config';
import { ref, onValue, off } from 'firebase/database';
import type { EventData } from '../../services/events.service';

type CalendarProps = {
    calendarType: CalendarTypes;
    setCalendarType: React.Dispatch<React.SetStateAction<CalendarTypes>>;
};

function CalendarPage({ calendarType, setCalendarType }: CalendarProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [visibleDate, setVisibleDate] = useState(new Date());

    const [location, setLocation] = useState<Location | null>(null);
    const currentLocation = useLocation();

    const { userData } = useContext(UserContext);
    const [events, setEvents] = useState<EventData[]>([]);

    useEffect(() => {
        setLocation(currentLocation);
    }, [currentLocation])

    useEffect(() => {
        if (!userData?.handle) return;
        const userEventsRef = ref(db, `users/${userData.handle}/participatesIn`);
        const eventListeners: Array<() => void> = [];
        let isMounted = true;

        const fetchAndListen = async () => {
            onValue(userEventsRef, async (snapshot) => {
                if (!isMounted) return;
                const participatesIn = snapshot.val() || {};
                const eventIds = Object.keys(participatesIn).filter(id => participatesIn[id]);
                const eventPromises = eventIds.map(async (eventId) => {
                    const eventRef = ref(db, `events/${eventId}`);
                    return new Promise<EventData | null>((resolve) => {
                        const listener = onValue(eventRef, (eventSnap) => {
                            if (!eventSnap.exists()) return resolve(null);
                            resolve({ id: eventId, ...eventSnap.val() });
                        }, { onlyOnce: true });
                        eventListeners.push(() => off(eventRef, 'value', listener));
                    });
                });
                const eventsArr = (await Promise.all(eventPromises)).filter(Boolean) as EventData[];
                setEvents(eventsArr);
            });
        };
        fetchAndListen();
        return () => {
            isMounted = false;
            off(userEventsRef);
            eventListeners.forEach(unsub => unsub());
        };
    }, [userData?.handle]);

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
                                        events={events}
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
                                        events={events}
                                    />
                                </div>
                            </AnimatedPage>
                        )}

                        <aside className="w-[20%] bg-base-300 p-4 rounded-box h-full overflow-hidden">
                            <Sidebar selectedDate={selectedDate} events={events} />
                        </aside>
                    </div>
                </div>
                <AnimatedOutlet />
            </LocationContext.Provider>
        </>
    );
}

export default CalendarPage;
