import { useState } from 'react';
import MonthView from '../../components/calendar/MonthView';
import Sidebar from '../../components/calendar/Sidebar';

function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div className="flex justify-center items-start bg-base-100 min-h-screen p-8">

      <div className="flex w-full max-w-6xl gap-6">

        {/* MonthView */}
        <div className="w-[700px]">
          <MonthView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        </div>

        {/* Sidebar */}
        <aside className="w-80 bg-base-200 border-l border-base-300 p-4 rounded-2xl">
          <Sidebar selectedDate={selectedDate} />
        </aside>

      </div>

    </div>
  );
}

export default CalendarPage;