export const ModalKeys = {
    AUTH: 'auth',
} as const;

export type ModalKeys = (typeof ModalKeys)[keyof typeof ModalKeys] | null;
