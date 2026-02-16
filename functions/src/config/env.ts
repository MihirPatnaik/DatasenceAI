// functions/src/config/env.ts

export interface EnvironmentConfig {
  isProduction: boolean;
  isEmulator: boolean;
  projectId: string;
  adminEmails: string[];
  costAlertThreshold: number;
  maxDailyCost: number;
}

export const getEnvironmentConfig = (): EnvironmentConfig => {
  // Use Firebase's built-in emulator detection
  const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true' && 
                    process.env.NODE_ENV !== 'production';
  const isProduction = process.env.NODE_ENV === 'production';
  const projectId = process.env.GCLOUD_PROJECT || 'datasenceai-c4e5f';
  
  const adminEmails = (process.env.ADMIN_EMAILS || 'mihir.patnaik@gmail.com,test@example.com')
    .split(',')
    .map(email => email.trim());

  return {
    isProduction,
    isEmulator: false, // 🔧 FORCE to false for now to test production
    projectId,
    adminEmails,
    costAlertThreshold: parseFloat(process.env.COST_ALERT_THRESHOLD || '0.10'),
    maxDailyCost: parseFloat(process.env.MAX_DAILY_COST || '5.00')
  };
};