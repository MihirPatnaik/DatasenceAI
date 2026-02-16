// src/smartsocial/hooks/useImageUpload.ts

import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useState } from "react";
import { useToast } from "../components/ui/use-toast";
import { storage } from "../utils/firebase";

interface UseImageUploadReturn {
  uploadImage: (file: File) => Promise<string | null>;
  deleteImage: (imageUrl: string) => Promise<void>;
  uploading: boolean;
  error: string | null;
  progress: number;
}

export const useImageUpload = (): UseImageUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      toast({
        title: "⚠️ Invalid file",
        description: "Please select an image file (jpg, png, etc.)",
        variant: "destructive",
      });
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      toast({
        title: "⚠️ Image too large",
        description: "Please upload an image under 5MB",
        variant: "destructive",
      });
      return null;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop();
      const fileName = `posts/${timestamp}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
      const storageRef = ref(storage, fileName);

      const uploadTask = uploadBytesResumable(storageRef, file);

      const downloadUrl = await new Promise<string>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setProgress(pct);
          },
          (err) => reject(err),
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          }
        );
      });

      // ✅ Toast once, cleanly
      toast({
        title: "✅ Image uploaded successfully",
        description: "Your image is ready to use",
      });

      // Don’t reset progress instantly — allow UI to catch up
      setTimeout(() => {
        setProgress(100);
        setUploading(false);
      }, 300);

      return downloadUrl;
    } catch (err: any) {
      console.error("❌ Upload failed:", err);
      setError(err.message || "Upload failed");
      toast({
        title: "❌ Upload failed",
        description: err.message || "Please try again",
        variant: "destructive",
      });
      setUploading(false);
      return null;
    }
  };

  const deleteImage = async (imageUrl: string): Promise<void> => {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
      toast({
        title: "🗑️ Image deleted",
        description: "Image removed successfully",
      });
    } catch (err: any) {
      console.error("❌ Delete failed:", err);
      toast({
        title: "❌ Delete failed",
        description: err.message || "Could not delete image",
        variant: "destructive",
      });
    }
  };

  return { uploadImage, deleteImage, uploading, error, progress };
};
