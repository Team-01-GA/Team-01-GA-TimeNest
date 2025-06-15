// EditEventModal.tsx
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from '../Modal/Modal';
import UserContext from '../../providers/UserContext';
import AlertContext from '../../providers/AlertContext';
import { getEventById, updateEvent } from '../../services/events.service';
import { AlertTypes } from '../../constants/alert.constants';
import { Icons } from '../../constants/icon.constants';

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
        <Modal title="Edit Event" width="500px" icon={Icons.MODAL_CREATE_EVENT}>
            <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                <input
                    className="input input-bordered"
                    type="text"
                    placeholder="Event title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
                <textarea
                    className="textarea textarea-bordered"
                    placeholder="Description (max 500 chars)"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />
                <div className="form-control">
                    <label className="label"><span className="label-text">Start date and time</span></label>
                    <input
                        className="input input-bordered"
                        type="datetime-local"
                        value={start}
                        onChange={e => setStart(e.target.value)}
                    />
                </div>
                <div className="form-control">
                    <label className="label"><span className="label-text">End date and time</span></label>
                    <input
                        className="input input-bordered"
                        type="datetime-local"
                        value={end}
                        onChange={e => setEnd(e.target.value)}
                    />
                </div>
                <input
                    className="input input-bordered"
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
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
                            onChange={() => setRecurrence(prev => prev.includes('Monthly') ? prev.filter(d => d !== 'Monthly') : ['Monthly'])}
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
                <div className="flex justify-end gap-2">
                    <button type="button" className="btn btn-sm" onClick={() => navigate(-1)}>Cancel</button>
                    <button className="btn btn-primary btn-sm" type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default EditEventModal;