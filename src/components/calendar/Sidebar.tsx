import { useState } from 'react';
import EventList from './EventList';
import ContactList from './ContactList';
// import ModalContext from '../../providers/ModalContext';


type SidebarProps = {
    selectedDate: Date;
};

function Sidebar({ selectedDate }: SidebarProps) {
    const [activeTab, setActiveTab] = useState<'day' | 'contacts'>('day');

    // const isAnyModalOpen = modalKey !== null;

    return (
        <div className="flex flex-col h-full relative">

        {/* <div
            className={`flex flex-col h-full transition-all duration-300 ${isAnyModalOpen ? 'opacity-40 pointer-events-none blur-sm' : ''
                }`}
        > */}

            {/* Sticky Top Controls */}
            <div className="p-2 border-b border-base-300 absolute top-0 left-0 w-full bg-base-300">
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
            <div className='w-full h-auto mt-20 overflow-y-auto'>
                {activeTab === 'day' ? <EventList selectedDate={selectedDate} /> : <ContactList />}
            </div>
        </div>
    );
}

export default Sidebar;