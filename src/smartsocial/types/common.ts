//src/smartsocial/types/common.ts

// Common types used across the application
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan?: 'free' | 'pro';
}

export interface MetricData {
  title: string;
  value: string | number;
  icon: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface QuotaData {
  captions: number;
  images: number;
  maxCaptions: number;
  maxImages: number;
}

export interface NavItem {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
}

export interface PreloadModule {
  default: React.ComponentType;
}