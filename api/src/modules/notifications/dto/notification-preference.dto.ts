import { IsBoolean, IsOptional, IsObject, IsInt, Min, Max } from 'class-validator';

export class UpdateNotificationPreferenceDto {
  @IsOptional()
  @IsBoolean()
  inAppEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  soundEnabled?: boolean;

  @IsOptional()
  @IsObject()
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

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(23)
  doNotDisturbStart?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(23)
  doNotDisturbEnd?: number;
}
