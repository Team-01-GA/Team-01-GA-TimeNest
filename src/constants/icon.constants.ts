export const Icons = {
    MODAL_AUTH: 'fa-solid fa-user-pen',
    MODAL_CREATE_EVENT: 'fa-solid fa-calendar-plus',
    LIGHT_MODE: 'fa-solid fa-sun',
    DARK_MODE_SYSTEM: 'fa-solid fa-desktop',
    DARK_MODE: 'fa-solid fa-moon',
    USER_DEFAULT_PIC: 'fa-solid fa-user-tie',
    MENU: 'fa-solid fa-bars',
    ADD: 'fa-solid fa-plus',
    REMOVE: 'fa-solid fa-minus'
} as const;

export type Icons = (typeof Icons)[keyof typeof Icons] | null;