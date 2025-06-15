import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import EventDetailsModal from './EventDetailsModal';
import Loader from '../Loader/Loader';
import { getEventById, type EventData } from '../../services/events.service';

function EventDetailsRouteModal() {
    const { eventId } = useParams();
    const [event, setEvent] = useState<EventData | null>(null);

    useEffect(() => {
        if (!eventId) return;

        const fetchEvent = async () => {
            const data = await getEventById(eventId);
            setEvent(data);
        };

        fetchEvent();
    }, [eventId]);

    if (!event) return <Loader />;
    return <EventDetailsModal event={event} />;
}

export default EventDetailsRouteModal;