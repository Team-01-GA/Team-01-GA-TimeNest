import { useContext, useState, useEffect } from 'react';
import Modal from '../Modal/Modal';
import AppContext from '../../providers/UserContext';
import AlertContext from '../../providers/AlertContext';
import { addEvent } from '../../services/events.service';
import { AlertTypes } from '../../constants/alert.constants';
import { Icons } from '../../constants/icon.constants';
import { useLocation, useNavigate } from 'react-router-dom';

function CreateEventModal() {
    const { userData } = useContext(AppContext);
    const { showAlert } = useContext(AlertContext);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [location, setLocation] = useState('');
    const [recurrence, setRecurrence] = useState<string[]>([]);
    const [isPublic, setIsPublic] = useState(true);
    const [loading, setLoading] = useState(false);

    const urlPath = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        setTitle('');
        setDescription('');
        setStart('');
        setEnd('');
        setLocation('');
        setRecurrence([]);
        setIsPublic(true);
        setLoading(false);

    }, [urlPath]);

    const toggleDay = (day: string) => {
        setRecurrence((prev) =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleSubmit = async () => {

        if (!userData?.handle) {
            showAlert(AlertTypes.ERROR, 'You must be logged in to create an event.');
            return;
        }

        if (!title || title.trim().length < 3) {
            showAlert(AlertTypes.ERROR, 'Title must be at least 3 characters.');
            return;
        }

        if (!start) {
            showAlert(AlertTypes.ERROR, 'Start date is required.');
            return;
        }

        if (!end) {
            showAlert(AlertTypes.ERROR, 'End date is required.');
            return;
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        const sameDay =
            startDate.getFullYear() === endDate.getFullYear() &&
            startDate.getMonth() === endDate.getMonth() &&
            startDate.getDate() === endDate.getDate();

        // Multi-day check for recurring events
        if (recurrence.length > 0 && !sameDay) {
            showAlert(AlertTypes.ERROR, 'Recurring events must start and end on the same day.');
            return;
        }

        // Determine if this is a multi-day event
        const isMultiDay = !sameDay;

        try {
            setLoading(true);
            await addEvent({
                title,
                description,
                start,
                end,
                createdBy: userData.handle,
                createdOn: new Date().toISOString(),
                participants: [userData.handle],
                isPublic,
                location,
                recurrence,
                isMultiDay
            });

            showAlert(AlertTypes.SUCCESS, 'Event created successfully!');
            // navigate(-1);
            navigate('/app/calendar', { replace: true });
        } catch (e: unknown) {
            if (e instanceof Error) {
                showAlert(AlertTypes.ERROR, e.message);
            } else {
                showAlert(AlertTypes.ERROR, 'Failed to create event.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Create New Event" width="500px" icon={Icons.MODAL_CREATE_EVENT}>
            <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
            >
                <input
                    className="input input-bordered"
                    type="text"
                    placeholder="Event title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                    className="textarea textarea-bordered"
                    placeholder="Description (max 500 chars)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Start date and time</span>
                    </label>
                    <input
                        className="input input-bordered"
                        type="datetime-local"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                    />
                </div>
                
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">End date and time</span>
                    </label>
                    <input
                        className="input input-bordered"
                        type="datetime-local"
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                    />
                    
                    {start && end && new Date(start).getDate() !== new Date(end).getDate() && (
                        <div className="text-sm text-info mt-1 bg-info/10 p-2 rounded-md">
                            <span className="font-bold">Multi-day event:</span> This event spans multiple days. 
                            The same time slot will be used for each day in the range.
                        </div>
                    )}
                </div>
                <input
                    className="input input-bordered"
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />
                <div className="form-control">
                    <label className="label-text mb-1">Repeats on:</label>
                    <div className="grid grid-cols-4 gap-2">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                            <label key={day} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-sm"
                                    checked={recurrence.includes(day)}
                                    onChange={() => toggleDay(day)}
                                    disabled={recurrence.includes('Monthly')}
                                />
                                <span className="text-sm">{day}</span>
                            </label>
                        ))}
                    </div>

                    <label className="flex items-center gap-2 mt-2">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={recurrence.includes('Monthly')}
                            onChange={() => {
                                setRecurrence((prev) =>
                                    prev.includes('Monthly')
                                        ? prev.filter((d) => d !== 'Monthly')
                                        : ['Monthly'] // override all weekday selections
                                );
                            }}
                        />
                        <span className="text-sm">Monthly (same day each month)</span>
                    </label>
                </div>

                <label className="label cursor-pointer">
                    <span className="label-text">Public</span>
                    <input
                        type="checkbox"
                        className="toggle toggle-accent"
                        checked={isPublic}
                        onChange={() => setIsPublic(!isPublic)}
                    />
                </label>
                <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Event'}
                </button>
            </form>
        </Modal>
    );
}

export default CreateEventModal;