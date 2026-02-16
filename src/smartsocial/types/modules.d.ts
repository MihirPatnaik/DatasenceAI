//src/smartsocial/types/modules.d.ts

// Type declarations for dynamic imports
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

// For any other components you might import dynamically
declare module '../components/ChartComponent' {
  import { ComponentType } from 'react';
  const ChartComponent: ComponentType;
  export default ChartComponent;
}

declare module '../components/RecentActivity' {
  import { ComponentType } from 'react';
  const RecentActivity: ComponentType;
  export default RecentActivity;
}