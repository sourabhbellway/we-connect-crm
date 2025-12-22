export declare class UpdateNotificationPreferenceDto {
    inAppEnabled?: boolean;
    emailEnabled?: boolean;
    soundEnabled?: boolean;
    preferences?: {
        leadCreated?: boolean;
        leadUpdated?: boolean;
        leadAssigned?: boolean;
        clientReply?: boolean;
        paymentAdded?: boolean;
        paymentUpdated?: boolean;
        taskAssigned?: boolean;
        taskDue?: boolean;
        meetingScheduled?: boolean;
        followUpDue?: boolean;
        dealCreated?: boolean;
        dealWon?: boolean;
        dealLost?: boolean;
        quotationSent?: boolean;
        quotationAccepted?: boolean;
        invoiceSent?: boolean;
        invoicePaid?: boolean;
    };
    doNotDisturbStart?: number;
    doNotDisturbEnd?: number;
}
