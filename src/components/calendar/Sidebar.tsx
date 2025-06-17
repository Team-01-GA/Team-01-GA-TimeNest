import { useState, type CSSProperties } from 'react';
import EventList from './EventList';
import ContactList from './ContactList';
import { AnimatePresence, motion } from 'framer-motion'; // Add this import
import type { EventData } from '../../services/events.service';

type SidebarProps = {
    selectedDate: Date;
    events: EventData[];
};

function Sidebar({ selectedDate, events }: SidebarProps) {

    const [activeTab, setActiveTab] = useState<'Day' | 'Contacts'>('Day');

    const higlighterStyles: CSSProperties = {
        left: activeTab === 'Day'
            ? 'calc(50% - 5.6rem)'
            : 'calc(50% - 1.4rem)',
        transition: 'all 0.3s ease',
        width: activeTab === 'Day'
            ? '4rem'
            : '7rem'
    }

    function handleTabChange(tab: 'Day' | 'Contacts') {
        if (tab === activeTab) return;
        setActiveTab(tab);
    }

    return (
        <div className="flex flex-col h-full relative">
            <div className="p-2 border-b border-base-300 absolute top-0 left-0 w-full bg-base-300">
                <div className="relative flex flex-row justify-center gap-8 p-7 pr-8 pl-8 h-8 items-center bg-base-200 rounded-box w-full">
                    <button className="bg-secondary rounded-box text-2xl absolute top-1/2 transform translate-y-[-50%] p-1 m-0 text-transparent z-0 pointer-events-none whitespace-nowrap" style={higlighterStyles}>
                        {activeTab === 'Day' ? 'Day' : 'Contacts'}
                    </button>
                    <button
                        className="btn p-0 m-0 z-10 bg-transparent border-none text-xl text-base-content cursor-pointer whitespace-nowrap"
                        onClick={() => handleTabChange('Day')}
                    >
                        Day
                    </button>
                    <button
                        className="btn p-0 m-0 z-10 bg-transparent border-none text-xl text-base-content cursor-pointer whitespace-nowrap"
                        onClick={() => handleTabChange('Contacts')}
                    >
                        Contacts
                    </button>
                </div>
                <h2 className="text-2xl font-semibold text-center mt-4">
                    {selectedDate.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                    })}
                </h2>
            </div>
            <div className='w-full h-auto mt-30 overflow-y-auto overflow-x-hidden relative'>
                <AnimatePresence mode="wait" initial={false}>
                    {activeTab === 'Day' ? (
                        <motion.div
                            key="day"
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -100, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="w-full"
                        >
                            <EventList selectedDate={selectedDate} events={events} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="contacts"
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 100, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="w-full"
                        >
                            <ContactList />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default Sidebar;