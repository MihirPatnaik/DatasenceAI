// src/smartsocial/components/media/ImageUploader.tsx

import { useState } from "react";
import { useImageUpload } from "../../hooks/useImageUpload";

interface Props {
  onImageUploaded: (url: string) => void;
  onImageRemoved: () => void;
  existingImageUrl?: string;
}

export const ImageUploader: React.FC<Props> = ({
  onImageUploaded,
  onImageRemoved,
  existingImageUrl,
}) => {
  const { uploadImage, deleteImage, uploading, progress } = useImageUpload();
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingImageUrl || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ Step 1: Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    // ✅ Step 2: Start upload
    const uploadedUrl = await uploadImage(file);

    // ✅ Step 3: Replace preview with final Firebase URL
    if (uploadedUrl) {
      setPreviewUrl(uploadedUrl);
      onImageUploaded(uploadedUrl);
    } else {
      // Upload failed, revert preview
      setPreviewUrl(existingImageUrl || null);
    }
  };

  const handleRemove = async () => {
    if (previewUrl) {
      await deleteImage(previewUrl);
    }
    setPreviewUrl(null);
    onImageRemoved();
  };

  return (
    <div className="w-full space-y-2">
      {previewUrl ? (
        <div className="relative border-2 border-dashed border-green-400 rounded-lg p-4 flex flex-col items-center">
          <img
            src={previewUrl}
            alt="Preview"
            className="rounded-md shadow-md max-h-48 object-contain"
          />
          <button
            onClick={handleRemove}
            disabled={uploading}
            className="absolute top-2 right-2 text-red-600 hover:underline text-sm"
          >
            Remove
          </button>
          {uploading && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      ) : (
        <label className="cursor-pointer border-2 border-dashed border-gray-300 p-6 rounded-lg flex flex-col items-center hover:border-purple-400 transition">
          <span className="text-sm text-gray-600">Click to upload</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
};
