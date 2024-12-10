export interface PubSubKeys {
    pubkey: string;
    subkey: string;
    authkey: string;
}

export enum PubnubNetworkStatus {
    PNConnectedCategory = 'PNConnectedCategory',
    PNNetworkDownCategory = 'PNNetworkDownCategory',
    PNNetworkUpCategory = 'PNNetworkUpCategory',
    PNNetworkIssuesCategory = 'PNNetworkIssuesCategory',
    PNBadRequestCategory = 'PNBadRequestCategory',
    PNUnknownCategory = 'PNUnknownCategory',
    PNRequestMessageCountExceedCategory = 'PNRequestMessageCountExceedCategory',
    PNTimeoutCategory = 'PNTimeoutCategory',
    PNDecryptionErrorCategory = 'PNDecryptionErrorCategory',
    PNMalformedResponseCategory = 'PNMalformedResponseCategory',
    PNAccessDeniedCategory = 'PNAccessDeniedCategory',
    PNReconnectedCategory = 'PNConnectedCategory',
}
