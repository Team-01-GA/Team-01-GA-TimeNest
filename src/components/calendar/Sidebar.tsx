import { useState, type CSSProperties } from 'react';
import EventList from './EventList';
import ContactList from './ContactList';

type SidebarProps = {
    selectedDate: Date;
};

function Sidebar({ selectedDate }: SidebarProps) {

    const [activeTab, setActiveTab] = useState<'Day' | 'Contacts'>('Day');

    const higlighterStyles: CSSProperties = {
            left: activeTab === 'Day'
                ? 'calc(1.1rem)'
                : 'calc(100% - 1.1rem)',
            transform: activeTab === 'Day'
                ? 'translateX(0)'
                : 'translateX(-100%)',
            transition: 'all 0.3s ease',
            width: activeTab === 'Day'
                ? '4rem'
                : '7rem'
        }

    return (
        <div className="flex flex-col h-full relative">
            <div className="p-2 border-b border-base-300 absolute top-0 left-0 w-full bg-base-300">
                <div className="relative flex flex-row justify-between p-7 pr-8 pl-8 h-8 items-center bg-base-200 rounded-box w-full">
                    <button className="bg-secondary rounded-box text-2xl absolute top-1/2 transform translate-y-[-50%] p-1 m-0 text-transparent z-0 pointer-events-none whitespace-nowrap" style={higlighterStyles}>
                        {activeTab === 'Day' ? 'Day' : 'Contacts'}
                    </button>
                    <button
                        className="btn p-0 m-0 z-10 bg-transparent border-none text-xl text-base-content cursor-pointer whitespace-nowrap"
                        onClick={() => setActiveTab('Day')}
                    >
                        Day
                    </button>
                    <button
                        className="btn p-0 m-0 z-10 bg-transparent border-none text-xl text-base-content cursor-pointer whitespace-nowrap"
                        onClick={() => setActiveTab('Contacts')}
                    >
                        Contacts
                    </button>
                </div>
                <h2 className="text-lg font-semibold text-center mt-4">
                    {selectedDate.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                    })}
                </h2>
            </div>
            <div className='w-full h-auto mt-30 overflow-y-auto'>
                {activeTab === 'Day' ? <EventList selectedDate={selectedDate} /> : <ContactList />}
            </div>
        </div>
    );
}

export default Sidebar;