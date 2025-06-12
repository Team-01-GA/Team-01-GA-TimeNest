import { ref, push, update, get } from 'firebase/database';
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
    recurrence?: string[];
}

function isOverlapping(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
    return aStart < bEnd && aEnd > bStart;
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

        // disable event creation for past dates
        const now = new Date();
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);

        if (startDate < now) {
            throw new Error('Cannot create events in the past.');
        }

        if (endDate <= startDate) {
            throw new Error('End time must be after start time.');
        }

        // Prevent overlapping
        const allEvents = await getAllEvents();

        const overlaps = allEvents.some(existing => {
            const existingStart = new Date(existing.start);
            const existingEnd = new Date(existing.end);

            // Skip same event if editing (optional logic)
            if (existing.id === event.id) return false;

            // Skip recurring events (optional)
            if (existing.recurrence?.length) return false;

            return isOverlapping(startDate, endDate, existingStart, existingEnd);
        });

        if (overlaps) {
            throw new Error('This event overlaps with an existing one.');
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


export const getAllEvents = async (): Promise<EventData[]> => {
    try {
        const snapshot = await get(ref(db, 'events'));
        if (!snapshot.exists()) return [];

        return Object.values(snapshot.val()) as EventData[];
    } catch (error) {
        console.error('Error fetching all events:', error);
        return [];
    }

};


export const getEventsForDate = async (targetDate: Date): Promise<EventData[]> => {
    try {
        const allEvents = await getAllEvents();
        return allEvents.filter((event) => {
            const start = new Date(event.start);
            const end = new Date(event.end);

            const isSameDay = (date: Date) =>
                date.getDate() === targetDate.getDate() &&
                date.getMonth() === targetDate.getMonth() &&
                date.getFullYear() === targetDate.getFullYear();

            if (isSameDay(start)) return true;

            // Multi-day events
            if (start <= targetDate && end >= targetDate) return true;

            // Recurring logic
            if (event.recurrence && event.recurrence.length > 0) {
                const dayName = targetDate.toLocaleString('en-US', { weekday: 'long' });

                if (targetDate >= start) {
                    return event.recurrence.includes(dayName);
                }
            }

            return false;
        });
    } catch (error) {
        console.error('Error filtering events by date:', error);
        return [];
    }
};