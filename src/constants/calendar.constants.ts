export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const CalendarTypes = {
    WEEK: 'WEEK',
    MONTH: 'MONTH',
    YEAR: 'YEAR',
} as const;

export type CalendarTypes = (typeof CalendarTypes)[keyof typeof CalendarTypes] | null;