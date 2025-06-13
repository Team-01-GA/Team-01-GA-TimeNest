export const DropdownTypes = {
    PROFILE_MODAL_CONTACTS: 'profileModalContacts',
    PROFILE_MODAL: 'profileModal',
} as const;

export type DropdownTypes = (typeof DropdownTypes)[keyof typeof DropdownTypes];