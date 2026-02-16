//src/smartsocial/vite-env.d.ts

/// <reference types="vite/client" />

// Declare modules for TypeScript
declare module '../pages/Dashboard' {
  import { ComponentType } from 'react';
  const Dashboard: ComponentType;
  export default Dashboard;
}

declare module '../pages/Posts' {
  import { ComponentType } from 'react';
  const Posts: ComponentType;
  export default Posts;
}

declare module '../components/MetricsCard' {
  import { ComponentType } from 'react';
  const MetricsCard: ComponentType<any>;
  export default MetricsCard;
}