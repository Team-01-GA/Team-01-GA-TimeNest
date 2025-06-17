import { ref, push, update, get, child } from 'firebase/database';
import { db } from '../config/firebase-config';

export interface EventData {
    id: string;
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
    isMultiDay?: boolean;
}

export const addEvent = async (event: Omit<EventData, 'id'>) => {
    try {
        if (!event.title || event.title.length < 3 || event.title.length > 30) {
            throw new Error('Title must be between 3 and 30 characters.');
        }

        if (event.description && event.description.length > 500) {
            throw new Error('Description must be at most 500 characters.');
        }

        if (!event.createdBy) {
            throw new Error('Missing creator handle.');
        }

        if (!event.start || !event.end) {
            throw new Error('Start and end dates are required.');
        }

        const now = new Date();
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);

        if (startDate < now) {
            throw new Error('Cannot create events in the past.');
        }

        if (endDate <= startDate) {
            throw new Error('End time must be after start time.');
        }

        if (event.recurrence && event.recurrence.length > 0) {
            const sameDay = startDate.getDate() === endDate.getDate() &&
                startDate.getMonth() === endDate.getMonth() &&
                startDate.getFullYear() === endDate.getFullYear();

            if (!sameDay) {
                throw new Error('Recurring events must start and end on the same day.');
            }
        }

        const isMultiDay = startDate.getDate() !== endDate.getDate() ||
            startDate.getMonth() !== endDate.getMonth() ||
            startDate.getFullYear() !== endDate.getFullYear();
        event.isMultiDay = isMultiDay;

        if (!event.participants.includes(event.createdBy)) {
            event.participants.push(event.createdBy);
        }

        const result = await push(ref(db, 'events'), event);
        const eventId = result.key;

        if (!eventId) throw new Error('Event ID not generated');

        await update(ref(db), {
            [`events/${eventId}/id`]: eventId,
            [`users/${event.createdBy}/events/${eventId}`]: true,
        });

        return eventId;
    } catch (error) {
        console.error('Error in addEvent:', error);
        throw error;
    }
};

// 	Admin features
// 	Global search bar
// 	Public event feeds
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

// 	Admin features
// 	Global search bar
// 	Public event feeds
export const getEventsForDate = async (targetDate: Date): Promise<EventData[]> => {
    try {
        const allEvents = await getAllEvents();

        const isSameDay = (d1: Date, d2: Date) =>
            d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();

        return allEvents.filter((event) => {
            const start = new Date(event.start);
            const end = new Date(event.end);

            if (isSameDay(start, targetDate)) return true;

            if (event.isMultiDay && targetDate >= start && targetDate <= end) return true;

            if (!event.isMultiDay && start <= targetDate && end >= targetDate) return true;

            if (event.recurrence && targetDate >= start) {
                if (event.recurrence.includes('Monthly') && targetDate.getDate() === start.getDate()) return true;
                const dayName = targetDate.toLocaleString('en-US', { weekday: 'long' });
                if (event.recurrence.includes(dayName)) return true;
            }

            return false;
        }).map(event => {
            if (event.isMultiDay) {
                const display = { ...event };
                const displayStart = new Date(targetDate);
                const originalStart = new Date(event.start);
                const originalEnd = new Date(event.end);

                displayStart.setHours(originalStart.getHours(), originalStart.getMinutes(), 0, 0);
                const displayEnd = new Date(targetDate);
                displayEnd.setHours(originalEnd.getHours(), originalEnd.getMinutes(), 0, 0);

                display.start = displayStart.toISOString();
                display.end = displayEnd.toISOString();
                return display;
            }

            return event;
        });
    } catch (error) {
        console.error('Error filtering events by date:', error);
        return [];
    }
};


export const getEventById = async (eventId: string): Promise<EventData> => {
    const snapshot = await get(child(ref(db), `events/${eventId}`));
    if (!snapshot.exists()) {
        throw new Error('Event not found');
    }
    return { id: eventId, ...snapshot.val() } as EventData;
}


export const deleteEvent = async (eventId: string, creatorHandle: string): Promise<void> => {
    try {
        await update(ref(db), {
            [`events/${eventId}`]: null,
            [`users/${creatorHandle}/events/${eventId}`]: null
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        throw error;
    }
}


// local user only
export const getUserEvents = async (handle: string): Promise<EventData[]> => {
    try {
        const snapshot = await get(ref(db, 'events'));
        if (!snapshot.exists()) return [];

        const allEvents = Object.values(snapshot.val()) as EventData[];
        return allEvents.filter(
            event => event.createdBy === handle || event.participants?.includes(handle)
        );
    } catch (error) {
        console.error('Error fetching user events:', error);
        return [];
    }
};


// local user only
export const getUserEventsForDate = async (
    handle: string,
    targetDate: Date
): Promise<EventData[]> => {
    try {
        const allEvents = await getUserEvents(handle);

        const isSameDay = (d1: Date, d2: Date) =>
            d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();

        return allEvents.filter((event) => {
            const start = new Date(event.start);
            const end = new Date(event.end);

            if (isSameDay(start, targetDate)) return true;

            if (event.isMultiDay && targetDate >= start && targetDate <= end) return true;

            if (!event.isMultiDay && start <= targetDate && end >= targetDate) return true;

            if (event.recurrence && targetDate >= start) {
                if (event.recurrence.includes('Monthly') && targetDate.getDate() === start.getDate()) return true;
                const dayName = targetDate.toLocaleString('en-US', { weekday: 'long' });
                if (event.recurrence.includes(dayName)) return true;
            }

            return false;
        }).map(event => {
            if (event.isMultiDay) {
                const display = { ...event };
                const displayStart = new Date(targetDate);
                const originalStart = new Date(event.start);
                const originalEnd = new Date(event.end);

                displayStart.setHours(originalStart.getHours(), originalStart.getMinutes(), 0, 0);
                const displayEnd = new Date(targetDate);
                displayEnd.setHours(originalEnd.getHours(), originalEnd.getMinutes(), 0, 0);

                display.start = displayStart.toISOString();
                display.end = displayEnd.toISOString();
                return display;
            }

            return event;
        });
    } catch (error) {
        console.error('Error filtering user events by date:', error);
        return [];
    }
};

export const updateEvent = async (eventId: string, updatedData: Partial<EventData>) => {
    try {
        // Fetch existing data first
        const snapshot = await get(child(ref(db), `events/${eventId}`));
        if (!snapshot.exists()) {
            throw new Error('Event not found');
        }

        const existingEvent = snapshot.val() as EventData;

        // Merge with updated data
        const mergedEvent: EventData = {
            ...existingEvent,
            ...updatedData,
            id: eventId,
        };

        await update(ref(db, `events/${eventId}`), mergedEvent);
    } catch (err) {
        console.error("Failed to update event:", err);
        throw err;
    }
};

export const addParticipantToEvent = async (eventId: string, participantHandle: string): Promise<void> => {
    try {
        const snapshot = await get(child(ref(db), `events/${eventId}`));
        if (!snapshot.exists()) {
            throw new Error('Event not found');
        }
        const event = snapshot.val() as EventData;

        const participants = Array.isArray(event.participants) ? event.participants : [];
        if (!participants.includes(participantHandle)) {
            participants.push(participantHandle);

            await update(ref(db, `events/${eventId}`), { participants });

            if (participantHandle !== event.createdBy) {
                await update(ref(db), {
                    [`users/${participantHandle}/participatesIn/${eventId}`]: true,
                });
            }
        }
    } catch (error) {
        console.error('Error adding participant to event:', error);
    }
};

export const removeParticipantFromEvent = async (eventId: string, participantHandle: string): Promise<void> => {
    try {
        const snapshot = await get(child(ref(db), `events/${eventId}`));
        if (!snapshot.exists()) throw new Error('Event not found');
        const event = snapshot.val() as EventData;

        const participants = Array.isArray(event.participants) ? event.participants : [];
        const newParticipants = participants.filter((h: string) => h !== participantHandle);

        await update(ref(db, `events/${eventId}`), { participants: newParticipants });

        await update(ref(db), {
            [`users/${participantHandle}/participatesIn/${eventId}`]: null,
        });
    } catch (error) {
        console.error('Error removing participant from event:', error);
        throw error;
    }
};