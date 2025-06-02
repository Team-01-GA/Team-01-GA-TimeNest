type SidebarProps = {
    selectedDate: Date;
};

function Sidebar({ selectedDate }: SidebarProps) {
    return (
        <div className="flex flex-col h-full max-h-[670px]"> 

            {/* Sticky Header */}
            <div className="p-2 border-b border-base-300 shrink-0">
                <h2 className="text-lg font-semibold">
                    {selectedDate.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                    })}
                </h2>
            </div>

            {/* Scrollable Events */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="p-2 bg-primary text-primary-content rounded shadow"
                    >
                        Event {i + 1}
                        Event {i + 1}
                        Event {i + 1}
                        Event {i + 1}
                        Event {i + 1}
                        Event {i + 1}
                        Event {i + 1}
                        Event {i + 1}
                        Event {i + 1}
                        Event {i + 1}
                        Event {i + 1}
                        Event {i + 1}
                        Event {i + 1}
                        Event {i + 1}
                        Event {i + 1}
                    </div>
                ))}
            </div>

        </div>
    );
}

export default Sidebar;