//functions/src/costMonitor.ts

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { getEnvironmentConfig } from "./config/env";

admin.initializeApp();

const db = admin.firestore();

/**
 * Estimate operation cost for logging
 */
export const estimateOperationCost = (operation: {
  type: string;
  featureCount?: number;
  reads?: number;
  writes?: number;
}): number => {
  const reads = operation.reads || 2; // Default throttle check reads
  let writes = operation.writes || 0;

  if (operation.type === "userPlan") writes = 1;
  if (operation.type === "planFeature") writes = 1;
  if (operation.type === "bulkFeatures") writes = operation.featureCount || 0;

  // Firestore costs: $0.0000006/read, $0.0000009/write
  return (reads * 0.0000006) + (writes * 0.0000009);
};

/**
 * Track admin operation cost
 */
export const trackAdminOperationCost = async (
  adminUid: string,
  operation: any,
  estimatedCost: number
) => {
  const env = getEnvironmentConfig();
  const today = new Date().toISOString().split('T')[0];
  const costDocRef = db.collection("costTracking").doc(today);
  
  try {
    await db.runTransaction(async (transaction) => {
      const costDoc = await transaction.get(costDocRef);
      const currentData = costDoc.exists ? costDoc.data() : { totalCost: 0, operations: [] };
      
      const newTotalCost = (currentData.totalCost || 0) + estimatedCost;
      
      // Check if we're exceeding daily limit
      if (newTotalCost > env.maxDailyCost) {
        throw new Error(`Daily cost limit exceeded: $${newTotalCost.toFixed(6)}`);
      }
      
      transaction.set(costDocRef, {
        totalCost: newTotalCost,
        operations: [...(currentData.operations || []), {
          adminUid,
          operation,
          cost: estimatedCost,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        }],
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    });
    
    // Check for cost alerts
    if (estimatedCost > env.costAlertThreshold) {
      await sendCostAlert(adminUid, operation, estimatedCost);
    }
    
  } catch (error) {
    console.error("Cost tracking failed:", error);
  }
};

/**
 * Send cost alert (you can integrate with email/notification service)
 */
const sendCostAlert = async (adminUid: string, operation: any, cost: number) => {
  console.warn(`🚨 COST ALERT: Operation by ${adminUid} cost $${cost.toFixed(6)}`, operation);
  
  // Here you can integrate with:
  // - Email service (SendGrid, Mailgun)
  // - Slack webhook
  // - SMS service
  // - Firebase Cloud Messaging
};

/**
 * Scheduled function to reset daily cost tracking
 */
export const resetDailyCostTracking = functions.pubsub.schedule("0 0 * * *")
  .timeZone("UTC")
  .onRun(async (context) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Archive yesterday's data
    const yesterdayDoc = await db.collection("costTracking").doc(yesterdayStr).get();
    if (yesterdayDoc.exists) {
      await db.collection("costTrackingArchive").doc(yesterdayStr).set(yesterdayDoc.data()!);
      await db.collection("costTracking").doc(yesterdayStr).delete();
    }
    
    console.log("Daily cost tracking reset");
  });