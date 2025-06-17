// EditEventModal.tsx
import { useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from '../Modal/Modal';
import UserContext from '../../providers/UserContext';
import AlertContext from '../../providers/AlertContext';
import { getEventById, updateEvent } from '../../services/events.service';
import { AlertIcons, AlertTypes } from '../../constants/alert.constants';
import { Icons } from '../../constants/icon.constants';
import { motion, AnimatePresence } from 'framer-motion';

function EditEventModal() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { userData } = useContext(UserContext);
    const { showAlert } = useContext(AlertContext);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [location, setLocation] = useState('');
    const [recurrence, setRecurrence] = useState<string[]>([]);
    const [isPublic, setIsPublic] = useState(true);
    const [createdBy, setCreatedBy] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!eventId || !userData) return;

        const fetchEvent = async () => {
            try {
                const event = await getEventById(eventId);

                // Safeguard: Only allow creator or admin to edit
                if (event.createdBy !== userData.handle && !userData.isAdmin) {
                    showAlert(AlertTypes.ERROR, 'You are not authorized to edit this event.');
                    navigate('/app/calendar', { replace: true });
                    return;
                }

                setCreatedBy(event.createdBy);
                setTitle(event.title);
                setDescription(event.description || '');
                setStart(event.start);
                setEnd(event.end);
                setLocation(event.location || '');
                setRecurrence(event.recurrence || []);
                setIsPublic(event.isPublic);
            } catch (error) {
                console.error(error);
                showAlert(AlertTypes.ERROR, 'Failed to load event.');
                navigate('/app/calendar', { replace: true });
            }
        };

        fetchEvent();
    }, [eventId, userData, navigate, showAlert]);

    const toggleDay = (day: string) => {
        setRecurrence(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    // Memoized event summary (edit version)
    const eventSummary = useMemo(() => {
        if (!title && !start && !end && !location && (!recurrence || recurrence.length === 0)) return "";
        const startDate = start ? new Date(start) : null;
        const endDate = end ? new Date(end) : null;
        let summary = `You are about to edit a ${isPublic ? "public" : "private"} event`;
        if (title) summary += ` titled "${title}"`;
        if (startDate && endDate) {
            const startStr = `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            const endStr = `${endDate.toLocaleDateString()} ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            summary += ` from ${startStr} to ${endStr}`;
        } else if (startDate) {
            const startStr = `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            summary += ` starting at ${startStr}`;
        }
        if (location) summary += ` at ${location}`;
        const safeRecurrence = Array.isArray(recurrence) ? recurrence : [];
        if (safeRecurrence.length > 0) {
            if (safeRecurrence.includes('Monthly')) {
                summary += `, repeating monthly`;
            } else {
                const days = safeRecurrence.length === 1
                    ? safeRecurrence[0]
                    : safeRecurrence.slice(0, -1).join(', ') + ' and ' + safeRecurrence[safeRecurrence.length - 1];
                summary += `, repeating on ${days}`;
            }
        }
        summary += ".";
        return summary;
    }, [title, start, end, isPublic, location, recurrence]);

    const handleSubmit = async () => {
        if (!userData || (userData.handle !== createdBy && !userData.isAdmin)) {
            showAlert(AlertTypes.ERROR, 'You are not authorized to edit this event.');
            return;
        }

        if (!title || title.trim().length < 3) {
            showAlert(AlertTypes.ERROR, 'Title must be at least 3 characters.');
            return;
        }

        if (!start || !end) {
            showAlert(AlertTypes.ERROR, 'Start and end dates are required.');
            return;
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        if (recurrence.length > 0 && startDate.toDateString() !== endDate.toDateString()) {
            showAlert(AlertTypes.ERROR, 'Recurring events must start and end on the same day.');
            return;
        }

        const isMultiDay = startDate.toDateString() !== endDate.toDateString();

        try {
            setLoading(true);
            await updateEvent(eventId!, {
                title: title.trim(),
                description: description.trim(),
                start,
                end,
                location: location.trim(),
                recurrence,
                isPublic,
                isMultiDay,
            });
            showAlert(AlertTypes.SUCCESS, 'Event updated successfully.');
            navigate('/app/calendar', { replace: true });
        } catch (error) {
            console.error(error);
            showAlert(AlertTypes.ERROR, 'Failed to update event.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Modal title="Edit Event" width="700px" icon={Icons.MODAL_CREATE_EVENT}>
                <form className="flex flex-col gap-4 p-4 bg-base-300 rounded-box" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                    <label className="floating-label">
                        <span>Event title</span>
                        <input
                            className="input input-lg w-full"
                            type="text"
                            placeholder="Event title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </label>
                    <label className="floating-label">
                        <span>Description (max 500 chars)</span>
                        <textarea
                            className="textarea input-lg w-full"
                            placeholder="Description (max 500 chars)"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </label>
                    <div className="form-control">
                        <label className="floating-label">
                            <span>Start date and time</span>
                            <input
                                className="input input-lg w-full"
                                type="datetime-local"
                                value={start}
                                onChange={e => setStart(e.target.value)}
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
                                onChange={e => setEnd(e.target.value)}
                            />
                        </label>
                    </div>
                    <label className="floating-label">
                        <span>Location</span>
                        <input
                            className="input input-lg w-full"
                            type="text"
                            placeholder="Location"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
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
                                onChange={() => setRecurrence(prev => prev.includes('Monthly') ? prev.filter(d => d !== 'Monthly') : ['Monthly'])}
                            />
                            <span className="text-md">Monthly (same day each month)</span>
                        </label>
                    </div>
                    <div className="form-control flex flex-row gap-4 items-center">
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
                    <div className="form-control flex flex-row gap-2 items-center pt-4 border-t">
                        <button className="btn btn-primary btn-lg flex-1" type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button" className="btn btn-lg flex-1" onClick={() => navigate(-1)}>Cancel</button>
                    </div>
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
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
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

export default EditEventModal;