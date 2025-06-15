import Modal from "../Modal/Modal";
import { type EventData, deleteEvent } from "../../services/events.service";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import UserContext from "../../providers/UserContext";
import AlertContext from "../../providers/AlertContext";
import { AlertTypes } from "../../constants/alert.constants";

function EventDetailsModal({ event }: { event: EventData }) {
    const [showConfirm, setShowConfirm] = useState(false);

    const { userData } = useContext(UserContext);
    const { showAlert } = useContext(AlertContext);
    const navigate = useNavigate();

    const handleDelete = async () => {
        try {
            await deleteEvent(event.id!, event.createdBy);
            showAlert(AlertTypes.SUCCESS, "Event deleted successfully.");
            navigate('/app', { replace: true });
        } catch (err) {
            console.error("Failed to delete event", err);
            showAlert(AlertTypes.ERROR, "Failed to delete event.");
        }
    };

    return (
        <>
            <Modal title={event.title} width="w-[40rem]">
                <div className="flex flex-col gap-4">
                    <p className="break-words max-w-[36rem]">
                        <strong>Description:</strong> {event.description || 'N/A'}
                    </p>
                    <p><strong>Start:</strong> {new Date(event.start).toLocaleString()}</p>
                    <p><strong>End:</strong> {new Date(event.end).toLocaleString()}</p>
                    <p><strong>Location:</strong> {event.location || 'N/A'}</p>
                    <p>
                        <strong>Created By:</strong>{' '}
                        <Link
                            to={`/app/account/${event.createdBy}`}
                            className="px-2 py-1 bg-base-300 rounded hover:bg-base-200 transition text-sm"
                        >
                            {event.createdBy}
                        </Link>
                    </p>

                    {event.participants?.length > 0 && (
                        <div>
                            <strong>Participants ({event.participants.length}):</strong>
                            <ul className="flex flex-wrap gap-2 mt-1">
                                {event.participants.map((handle) => (
                                    <li key={handle}>
                                        <Link
                                            to={`/app/account/${handle}`}
                                            className="px-2 py-1 bg-base-300 rounded hover:bg-base-200 transition text-sm"
                                        >
                                            @{handle}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {userData && (userData.handle === event.createdBy || userData.isAdmin) && (
                        <div className="flex justify-end gap-4 mt-2">
                            <button onClick={() => setShowConfirm(true)} className="btn btn-error btn-sm">
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </Modal>

            {showConfirm && (
                <Modal title="Confirm Deletion" width="w-[30rem]">
                    <div className="flex flex-col gap-4">
                        <p>Are you sure you want to delete this event?</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowConfirm(false)} className="btn btn-sm">Cancel</button>
                            <button onClick={handleDelete} className="btn btn-error btn-sm">Delete</button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
}

export default EventDetailsModal;