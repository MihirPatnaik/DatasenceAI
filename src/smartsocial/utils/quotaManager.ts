//src/smartsocial/utils/quotaManager.ts

import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { getUserContext } from "./userContext";

// Real-time quota subscription
export const subscribeToQuota = (
  userId: string,
  callback: (quota: any, plan: string) => void
) => {
  if (!userId) {
    console.warn("subscribeToQuota: Missing userId");
    return null;
  }

  const quotaRef = doc(db, "users", userId, "quota", "meta");

  return onSnapshot(quotaRef, async (snap) => {
    const { plan } = await getUserContext(userId);

    if (!snap.exists()) {
      console.warn("quota/meta missing for user ", userId);
      // Return default structure with 0 used
      callback({
        usedCaptionQuota: 0,
        captionQuota: 5,
        usedImageQuota: 0,
        imageQuota: 2,
        usedPostQuota: 0,
        postQuota: 10
      }, plan);
      return;
    }

    const quotaData = snap.data();
    
    // Ensure consistent structure
    const normalizedQuota = {
      usedCaptionQuota: quotaData.usedCaptionQuota ?? 0,
      captionQuota: quotaData.captionQuota ?? 5,
      usedImageQuota: quotaData.usedImageQuota ?? 0,
      imageQuota: quotaData.imageQuota ?? 2,
      usedPostQuota: quotaData.usedPostQuota ?? 0,
      postQuota: quotaData.postQuota ?? 10,
      ...quotaData
    };

    callback(normalizedQuota, plan);
  });
};

// One-time quota fetch
export const useQuota = async (userId: string) => {
  if (!userId) return null;

  const quotaRef = doc(db, "users", userId, "quota", "meta");
  const snap = await getDoc(quotaRef);

  if (!snap.exists()) {
    // Return default structure with 0 used
    return {
      usedCaptionQuota: 0,
      captionQuota: 5,
      usedImageQuota: 0,
      imageQuota: 2,
      usedPostQuota: 0,
      postQuota: 10
    };
  }

  const quotaData = snap.data();
  
  // Normalize structure
  return {
    usedCaptionQuota: quotaData.usedCaptionQuota ?? 0,
    captionQuota: quotaData.captionQuota ?? 5,
    usedImageQuota: quotaData.usedImageQuota ?? 0,
    imageQuota: quotaData.imageQuota ?? 2,
    usedPostQuota: quotaData.usedPostQuota ?? 0,
    postQuota: quotaData.postQuota ?? 10,
    ...quotaData
  };
};