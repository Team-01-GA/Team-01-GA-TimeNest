type EventListProps = {
    count?: number;
};

function EventList({ count = 50 }: EventListProps) {
    return (
        // scrollable
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {[...Array(count)].map((_, i) => (
                <div
                    key={i}
                    className="p-2 bg-primary text-primary-content rounded shadow"
                >
                    <h3 className="font-semibold">Meeting with client</h3>
                    <p className="text-sm">10:00 – 11:30, Office A</p>
                </div>
            ))}
        </div>
    );
}

export default EventList;