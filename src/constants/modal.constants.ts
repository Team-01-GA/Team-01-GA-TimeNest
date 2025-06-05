export const ModalIcons = {
    AUTH: 'fa-solid fa-user-pen',
    CREATE_EVENT: 'fa-solid fa-calendar-plus'
} as const;

export type ModalIcons = (typeof ModalIcons)[keyof typeof ModalIcons] | null;