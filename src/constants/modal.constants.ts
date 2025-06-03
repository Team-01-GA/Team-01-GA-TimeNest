export const ModalKeys = {
    AUTH: 'auth',
} as const;

export type ModalKeys = (typeof ModalKeys)[keyof typeof ModalKeys] | null;

export const ModalIcons = {
    AUTH: 'fa-solid fa-user-pen',
} as const;

export type ModalIcons = (typeof ModalIcons)[keyof typeof ModalIcons] | null;