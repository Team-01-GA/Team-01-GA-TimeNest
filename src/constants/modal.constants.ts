export const ModalKeys = {
    AUTH: 'auth',
    CREATE_EVENT: 'create-event',
} as const;

export type ModalKeys = (typeof ModalKeys)[keyof typeof ModalKeys] | null;

export const ModalIcons = {
    AUTH: 'fa-solid fa-user-pen',
    CREATE_EVENT: 'fa-solid fa-calendar-plus'
} as const;

export type ModalIcons = (typeof ModalIcons)[keyof typeof ModalIcons] | null;