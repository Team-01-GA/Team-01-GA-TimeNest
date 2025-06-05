import { useContext, useState, useEffect } from 'react';
import Modal from '../Modal/Modal';
import AppContext from '../../providers/AppContext';
import AlertContext from '../../providers/AlertContext';
import { addEvent } from '../../services/events.service';
import { AlertTypes } from '../../constants/alert.constants';
import { ModalIcons } from '../../constants/modal.constants';
import { useLocation, useNavigate } from 'react-router-dom';

function CreateEventModal() {
    const { userData } = useContext(AppContext);
    const { showAlert } = useContext(AlertContext);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [location, setLocation] = useState('');
    const [recurrence, setRecurrence] = useState('');
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
        setRecurrence('');
        setIsPublic(true);
        setLoading(false);

    }, [urlPath]);

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
                recurrence: recurrence || 'no'
            });

            showAlert(AlertTypes.SUCCESS, 'Event created successfully!');
            navigate(-1);
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
        <Modal title="Create New Event" width="500px" icon={ModalIcons.CREATE_EVENT}>
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
                <input
                    className="input input-bordered"
                    type="datetime-local"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                />
                <input
                    className="input input-bordered"
                    type="datetime-local"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                />
                <input
                    className="input input-bordered"
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />
                <div className="form-control">
                    <select
                        className="select select-bordered"
                        value={recurrence}
                        onChange={(e) => setRecurrence(e.target.value)}
                    >
                        <option value="">No recurrence</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                    </select>
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