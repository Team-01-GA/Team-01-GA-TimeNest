import { useContext, useState, useEffect, useMemo } from 'react';
import Modal from '../Modal/Modal';
import AppContext from '../../providers/UserContext';
import AlertContext from '../../providers/AlertContext';
import { addEvent } from '../../services/events.service';
import { AlertIcons, AlertTypes } from '../../constants/alert.constants';
import { Icons } from '../../constants/icon.constants';
import { useLocation, useNavigate } from 'react-router-dom';
import { getUserByHandle } from '../../services/users.service';
import { motion, AnimatePresence } from 'framer-motion';

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
        if (userData) {
            const getUserDetails = async () => {
                const userObject = await getUserByHandle(userData.handle);
                setIsPublic(userObject.newEventsPublic);
            }

            getUserDetails();
        }
    }, [userData]);

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

    // Memoized event summary
    const eventSummary = useMemo(() => {
        if (!title && !start && !end && !location && recurrence.length === 0) return "";
        const startDate = start ? new Date(start) : null;
        const endDate = end ? new Date(end) : null;
        let summary = `You are about to create a ${isPublic ? "public" : "private"} event`;
        if (title) summary += ` titled "${title}"`;
        if (startDate && endDate) {
            const startStr = `${startDate.toLocaleDateString()} at ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            const endStr = `${endDate.toLocaleDateString()} at ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            summary += ` from ${startStr} to ${endStr}`;
        } else if (startDate) {
            const startStr = `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            summary += ` starting at ${startStr}`;
        }
        if (location) summary += ` at ${location}`;
        if (recurrence.length > 0) {
            if (recurrence.includes('Monthly')) {
                summary += `, repeating monthly`;
            } else {
                const days = recurrence.length === 1
                    ? recurrence[0]
                    : recurrence.slice(0, -1).join(', ') + ' and ' + recurrence[recurrence.length - 1];
                summary += `, repeating on ${days}`;
            }
        }
        summary += ".";
        return summary;
    }, [title, start, end, isPublic, location, recurrence]);

    return (
        <>
            <Modal title="Create New Event" width="700px" icon={Icons.MODAL_CREATE_EVENT}>
                <form
                    className="flex flex-col gap-4 p-4 bg-base-300 rounded-box"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <label className="floating-label">
                        <span>Event title</span>
                        <input
                            className="input input-lg w-full"
                            type="text"
                            placeholder="Event title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </label>
                    <label className="floating-label">
                        <span>Description (max 500 chars)</span>
                        <textarea
                            className="textarea input-lg w-full"
                            placeholder="Description (max 500 chars)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </label>
                    <div className="form-control">
                        <label className="floating-label">
                            <span>Start date and time</span>
                            <input
                                className="input input-lg w-full"
                                type="datetime-local"
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                            />
                        </label>
                    </div>
                    <div className="form-control">
                        <label className="floating-label">
                            <span>End date and time</span>
                            <input
                                className="input input-lg w-full"
                                type="datetime-local"
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                            />
                        </label>
                        {start && end && new Date(start).getDate() !== new Date(end).getDate() && (
                            <div className="text-md text-info-content mt-2 bg-info/70 p-4 rounded-box">
                                <span className="font-bold">Multi-day event:</span> This event spans multiple days. 
                                The same time slot will be used for each day in the range.
                            </div>
                        )}
                    </div>
                    <label className="floating-label">
                        <span>Location</span>
                        <input
                            className="input input-lg w-full"
                            type="text"
                            placeholder="Location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </label>
                    <div className="form-control p-4 bg-neutral rounded-box text-neutral-content">
                        <label className="label text-lg">Repeats on:</label>
                        <div className="grid grid-cols-4 gap-4 mt-2 mb-4">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                <label key={day} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-md checkbox-primary"
                                        checked={recurrence.includes(day)}
                                        onChange={() => toggleDay(day)}
                                        disabled={recurrence.includes('Monthly')}
                                    />
                                    <span className="text-md">{day}</span>
                                </label>
                            ))}
                        </div>
                        <label className="flex items-center gap-2 mt-2">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-md checkbox-primary"
                                checked={recurrence.includes('Monthly')}
                                onChange={() => {
                                    setRecurrence((prev) =>
                                        prev.includes('Monthly')
                                            ? prev.filter((d) => d !== 'Monthly')
                                            : ['Monthly']
                                    );
                                }}
                            />
                            <span className="text-md">Monthly (same day each month)</span>
                        </label>
                    </div>
                    <div className="form-control flex flex-row gap-4 w-full items-center">
                        <button
                            type="button"
                            className={`btn btn-lg flex-1 ${isPublic ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setIsPublic(true)}
                        >
                            Public
                        </button>
                        <button
                            type="button"
                            className={`btn btn-lg flex-1 ${!isPublic ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setIsPublic(false)}
                        >
                            Private
                        </button>
                    </div>
                    <button className="btn btn-primary btn-lg mt-2" type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Event'}
                    </button>
                </form>
                <AnimatePresence>
                    {eventSummary && (
                        <motion.div
                            key="event-summary-container"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.3 }}
                            className="flex gap-4 w-full bg-info p-4 mt-4 mb-4 rounded-box shadow"
                        >
                            <i className={`${AlertIcons(AlertTypes.INFO)} text-2xl mt-1`}></i>
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={eventSummary}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className='text-lg text-info-content'
                                >
                                    {eventSummary}
                                </motion.p>
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Modal>
        </>
    );
}

export default CreateEventModal;