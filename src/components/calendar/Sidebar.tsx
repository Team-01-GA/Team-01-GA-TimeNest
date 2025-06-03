import { useState } from 'react';
import EventList from './EventList';
import ContactList from './ContactList';

type SidebarProps = {
    selectedDate: Date;
};

function Sidebar({ selectedDate }: SidebarProps) {
    const [activeTab, setActiveTab] = useState<'day' | 'contacts'>('day');

    return (
        <div className="flex flex-col h-full">

            {/* Sticky Top Controls */}
            <div className="p-2 border-b border-base-300 shrink-0 sticky top-0 bg-base-200 z-10">
                <div className="flex justify-center mb-2">
                    <button
                        className={`btn btn-xs rounded-r-none ${activeTab === 'day' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('day')}
                    >
                        Day
                    </button>
                    <button
                        className={`btn btn-xs rounded-l-none ${activeTab === 'contacts' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('contacts')}
                    >
                        Contacts
                    </button>
                </div>

                <h2 className="text-lg font-semibold text-center">
                    {selectedDate.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                    })}
                </h2>
            </div>

            {/* Scrollable View */}
            {activeTab === 'day' ? <EventList /> : <ContactList />}
        </div>
    );
}

export default Sidebar;