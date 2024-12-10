export const VERIFICATION_STATUS = {
    KYC: {
        PENDING: 'pending',
        REQUESTED: 'requested',
        EXPIRED: 'expired',
        REJECTED: 'rejected',
        APPROVED: 'approved',
        INITIATED: 'initiated',
    },
    IDENTITY: {
        APPROVED: 'approved',
        PENDING: 'pending',
    },
};

export const VERIFICATION_MODE = {
    KYC: '1',
    MANUAL: '2',
};
