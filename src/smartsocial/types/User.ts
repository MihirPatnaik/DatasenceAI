// src/smartsocial/types/User.ts

export type PlanType = "free" | "Pro" | string;

export interface User {
  uid: string;
  id?: string; // backward compat if some code expects id
  email?: string;
  fullName?: string;
  provider?: "google" | "email";
  createdAt?: any;

  // important: planId links to plans/{planId}
  planId?: PlanType;

  // convenience: older docs may still hold onboarding.plan
  onboarding?: {
    plan?: "free" | "Pro";
    progress?: number;
    completed?: boolean;
    celebrated?: boolean;
    [k: string]: any;
  };

  // usage tracked on user doc for simple counts
  postsCreatedThisMonth?: number;
  quota?: { used?: number; limit?: number };

  // generic extras
  [k: string]: any;
}

// Feature keys as stored in Firestore planFeatures
export type AppFeature =
  | "analytics_access"
  | "image_quality"
  | "max_posts_per_month"
  | "social_connections"
  | "support_level"
  | "templates";
