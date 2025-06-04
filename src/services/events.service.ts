import { ref, push, update } from 'firebase/database';
import { db } from '../config/firebase-config';

export interface EventData {
    id?: string;
    title: string;
    description?: string;
    start: string;
    end: string;
    createdBy: string;
    createdOn: string;
    participants: string[];
    isPublic: boolean;
    location?: string;
    recurrence?: string;
}

export const addEvent = async (event: EventData) => {
    try {
        
        // Validate title
        if (!event.title || event.title.length < 3 || event.title.length > 30) {
            throw new Error('Title must be between 3 and 30 characters.');
        }

        // Validate description
        if (event.description && event.description.length > 500) {
            throw new Error('Description must be at most 500 characters.');
        }

        // Validate createdBy
        if (!event.createdBy) {
            throw new Error('Missing creator handle.');
        }
        
        // Validate start and end dates
        if (!event.start || !event.end) {
            throw new Error('Start and end dates are required.');
        }

        // Make sure creator is in participants
        if (!event.participants.includes(event.createdBy)) {
            event.participants.push(event.createdBy);
        }

        const result = await push(ref(db, 'events'), event);
        const eventId = result.key;

        if (!eventId) throw new Error('Event ID not generated');
        
        try {
            await update(ref(db), {
                [`events/${eventId}/id`]: eventId,
                [`users/${event.createdBy}/events/${eventId}`]: true,
            });
        } catch (error) {
            console.error('Error updating user events reference:', error);
        }

        return eventId;
    } catch (error) {
        console.error('Error in addEvent:', error);
        throw error;
    }
};