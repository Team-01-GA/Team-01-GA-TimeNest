export const DropdownTypes = {
    PROFILE_MODAL_CONTACTS: 'profileModalContacts',
    PROFILE_MODAL: 'profileModal',
    DELETE_LIST: 'deleteContactList',
    REMOVE_PROFILE_PIC: 'removeProfilePic',
} as const;

export type DropdownTypes = (typeof DropdownTypes)[keyof typeof DropdownTypes];