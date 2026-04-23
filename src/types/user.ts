export type UserRole = "teacher" | "student" | "school_teacher" | "university_teacher" | "tutor";

export type SubscriptionTier = "free" | "individual" | "school";
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled" | "none";

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role?: UserRole;
  school?: string;
  country: string; // default "LB"
  createdAt: number;
  examsGenerated: number;
  /** Unix timestamp (ms) when the Pro plan expires. Set by admin after Whish payment. */
  proExpiresAt?: number;
  subscription: {
    status: SubscriptionStatus;
    tier: SubscriptionTier;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    renewsAt?: number;
  };
}
