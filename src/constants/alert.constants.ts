export const AlertTypes = {
    BASE: 'alert',
    SUCCESS: 'alert alert-success',
    INFO: 'alert alert-info',
    WARNING: 'alert alert-warning',
    ERROR: 'alert alert-error',
} as const;

export type AlertTypes = (typeof AlertTypes)[keyof typeof AlertTypes];

export const AlertIcons = (alertType: AlertTypes): string => {
    switch (alertType) {
        case AlertTypes.SUCCESS:
            return 'fa-solid fa-circle-check';
            
        case AlertTypes.INFO:
            return 'fa-solid fa-circle-info';

        case AlertTypes.WARNING:
            return 'fa-solid fa-circle-exclamation';

        case AlertTypes.ERROR:
            return 'fa-solid fa-circle-xmark';

        default:
            return '';
    }
}
