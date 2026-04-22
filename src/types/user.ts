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
  subscription: {
    status: SubscriptionStatus;
    tier: SubscriptionTier;
    stripeCustomerId?: string;
    renewsAt?: number;
  };
}
