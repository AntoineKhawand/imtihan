export type UserRole = "teacher" | "student" | "school_teacher" | "university_teacher" | "tutor";

export type SubscriptionTier = "free" | "individual" | "school";
export type SubscriptionStatus = "none";

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role?: UserRole;
  school?: string;
  country: string; // default "LB"
  createdAt: number;
  examsGenerated: number;
  /** Exams generated in the current 30-day billing period. Reset by admin on extension. */
  monthlyExamsGenerated?: number;
  /** Unix ms when the current monthly period started. */
  monthlyPeriodStart?: number;
  /** Unix timestamp (ms) when the Pro plan expires. Set by admin after Whish payment. */
  proExpiresAt?: number;
  /** Unix ms of the last renewal reminder email sent — prevents duplicate sends. */
  lastReminderSentAt?: number;
  /** Unix ms of the last login. */
  lastLoginAt?: number;
  /** True if the user has manually requested a renewal in-app. */
  renewalRequested?: boolean;
  subscription: {
    status: SubscriptionStatus;
    tier: SubscriptionTier;
  };
}
