import { ref, push, update, get } from 'firebase/database';
import { db } from '../config/firebase-config';

export interface EventData {
    id?: string;
    title: string;
    description?: string;
    start: string;              // ISO date string
    end: string;                // ISO date string
    createdBy: string;
    createdOn: string;
    participants: string[];
    isPublic: boolean;
    location?: string;
    recurrence?: string[];      // Weekday names or 'Monthly'
    isMultiDay?: boolean;       // Flag for multi-day events
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

        // simulate overlaps for recurring events
        function getDatesInRange(start: Date, end: Date): Date[] {
            const dates = [];
            const current = new Date(start);
            while (current <= end) {
                dates.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }
            return dates;
        }

        // Determine if this is a multi-day event
        const isMultiDay = startDate.getDate() !== endDate.getDate() || 
                           startDate.getMonth() !== endDate.getMonth() || 
                           startDate.getFullYear() !== endDate.getFullYear();
        
        // Set the multi-day flag
        event.isMultiDay = isMultiDay;
        
        // For multi-day events, check each day independently with the same time slots
        const datesToCheck = getDatesInRange(startDate, endDate);

        const timeStart = new Date(event.start);
        const timeEnd = new Date(event.end);

        // If this is a recurring event, we need to make sure the start and end times are on the same day
        if (event.recurrence && event.recurrence.length > 0) {
            const sameDay = startDate.getDate() === endDate.getDate() && 
                           startDate.getMonth() === endDate.getMonth() && 
                           startDate.getFullYear() === endDate.getFullYear();
            
            if (!sameDay) {
                throw new Error('Recurring events must start and end on the same day.');
            }
        }

        const overlaps = datesToCheck.some(date => {
            // For each day in the range, we check the same time slot
            const newStart = new Date(date);
            newStart.setHours(timeStart.getHours(), timeStart.getMinutes(), 0, 0);

            const newEnd = new Date(date);
            newEnd.setHours(timeEnd.getHours(), timeEnd.getMinutes(), 0, 0);

            return allEvents.some(existing => {
                // Skip comparing with self (for updates)
                if (existing.id === event.id) return false;

                const existingStart = new Date(existing.start);
                const existingEnd = new Date(existing.end);
                
                // Handle existing multi-day events differently
                if (existing.isMultiDay) {
                    // For multi-day events, we check if the time slot overlaps on this specific day
                    const existingDateStart = new Date(date);
                    existingDateStart.setHours(existingStart.getHours(), existingStart.getMinutes(), 0, 0);
                    
                    const existingDateEnd = new Date(date);
                    existingDateEnd.setHours(existingEnd.getHours(), existingEnd.getMinutes(), 0, 0);
                    
                    return isOverlapping(newStart, newEnd, existingDateStart, existingDateEnd);
                }

                // Standard non-recurring event check
                if (!existing.recurrence || existing.recurrence.length === 0) {
                    // First check if this is the same day
                    const isSameDay = date.getDate() === existingStart.getDate() &&
                                      date.getMonth() === existingStart.getMonth() &&
                                      date.getFullYear() === existingStart.getFullYear();
                    
                    if (!isSameDay) return false;
                    return isOverlapping(newStart, newEnd, existingStart, existingEnd);
                }

                // Check if this is a recurring event and the date is after the event's start
                if (existing.recurrence && existing.recurrence.length > 0 && date >= existingStart) {
                    // Check if the recurring event would occur on this date
                    const isRecurringDay = 
                        // Weekly recurrence check - check by day of week
                        (existing.recurrence.includes(date.toLocaleString('en-US', { weekday: 'long' }))) ||
                        // Monthly recurrence check - check if same day of month
                        (existing.recurrence.includes('Monthly') && date.getDate() === existingStart.getDate());
                    
                    if (isRecurringDay) {
                        // Create time slots for this recurring instance
                        const recurringStart = new Date(date);
                        recurringStart.setHours(existingStart.getHours(), existingStart.getMinutes(), 0, 0);
    
                        const recurringEnd = new Date(date);
                        recurringEnd.setHours(existingEnd.getHours(), existingEnd.getMinutes(), 0, 0);
    
                        // Check for time slot overlap
                        return isOverlapping(newStart, newEnd, recurringStart, recurringEnd);
                    }
                }

                return false;
            });
        });

        if (overlaps) {
            console.log('Event overlap detected:', {
                newEvent: {
                    title: event.title,
                    start: event.start,
                    end: event.end,
                    recurrence: event.recurrence
                },
                dates: datesToCheck.map(d => d.toISOString().split('T')[0])
            });
            throw new Error('This event overlaps with an existing one. Please select a different time.');
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
        
        // Helper function to check if dates are on the same day
        const isSameDay = (date1: Date, date2: Date) =>
            date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
        
        return allEvents.filter((event) => {
            const start = new Date(event.start);
            const end = new Date(event.end);
            
            // Simple case: the event starts on this day
            if (isSameDay(start, targetDate)) return true;
            
            // Multi-day events handling
            if (event.isMultiDay) {
                // For multi-day events, we check if targetDate falls within the event's range
                // For each day, we use the same time slots
                const eventStartDate = new Date(start);
                const eventEndDate = new Date(end);
                
                // Set end of day for end date to include the full last day
                eventEndDate.setHours(23, 59, 59, 999);
                
                if (targetDate >= eventStartDate && targetDate <= eventEndDate) {
                    // Create a new event object specifically for this day's display
                    // The times remain the same but the date changes to the target date
                    return true;
                }
            } 
            // Traditional multi-day spanning event (not flagged as isMultiDay)
            else if (start <= targetDate && end >= targetDate) {
                return true;
            }
            
            // Recurring event logic
            if (event.recurrence && event.recurrence.length > 0) {
                // Only check for recurrences if the target date is on or after the event's start date
                if (targetDate >= start) {
                    // Check for monthly recurrence (same day of each month)
                    if (event.recurrence.includes('Monthly') && targetDate.getDate() === start.getDate()) {
                        return true;
                    }
                    
                    // Check for weekly recurrence (same day of week)
                    const dayName = targetDate.toLocaleString('en-US', { weekday: 'long' });
                    if (event.recurrence.includes(dayName)) {
                        return true;
                    }
                }
            }
            
            return false;
        }).map(event => {
            // If this is a multi-day event, we create a copy with the correct date for the sidebar
            if (event.isMultiDay) {
                const originalStart = new Date(event.start);
                const originalEnd = new Date(event.end);
                
                // Create copies for display in the sidebar
                const displayEvent = { ...event };
                
                // Set the correct display date (today's date)
                const displayStart = new Date(targetDate);
                displayStart.setHours(originalStart.getHours(), originalStart.getMinutes(), 0, 0);
                
                const displayEnd = new Date(targetDate);
                displayEnd.setHours(originalEnd.getHours(), originalEnd.getMinutes(), 0, 0);
                
                displayEvent.start = displayStart.toISOString();
                displayEvent.end = displayEnd.toISOString();
                
                return displayEvent;
            }
            
            return event;
        });
    } catch (error) {
        console.error('Error filtering events by date:', error);
        return [];
    }
};