//src/smartsocial/utils/planFallback.ts


import { AppFeature } from "../types/User";

const PlanPermissions: Record<string, Record<AppFeature, string | number | null>> = {
  free: {
    analytics_access: "read-only",
    image_quality: "standard",
    max_posts_per_month: 5,
    social_connections: 1,
    support_level: "community",
    templates: "basic",
  },
  Pro: {
    analytics_access: "full",
    image_quality: "high",
    max_posts_per_month: null,
    social_connections: 5,
    support_level: "priority",
    templates: "advanced",
  },
};

export default PlanPermissions;
