// src/smartsocial/components/media/DragDropZone.tsx

import { Upload, X } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface DragDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

export const DragDropZone: React.FC<DragDropZoneProps> = ({
  onFilesSelected,
  maxFiles = 1,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    const validFiles = files.filter(file => 
      acceptedTypes.includes(file.type) && file.size <= 5 * 1024 * 1024
    ).slice(0, maxFiles);

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
      
      // Create preview for first image
      if (validFiles[0].type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(validFiles[0]);
      }
    }
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept={acceptedTypes.join(',')}
        multiple={maxFiles > 1}
        className="hidden"
      />

      {preview ? (
        <div className="relative border-2 border-dashed border-green-300 rounded-lg p-4 bg-green-50">
          <img 
            src={preview} 
            alt="Preview" 
            className="max-h-48 mx-auto rounded"
          />
          <button
            onClick={clearPreview}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
            ${isDragging 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700">
            Drop your image here or click to browse
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Supports JPG, PNG, GIF, WEBP (Max 5MB)
          </p>
        </div>
      )}
    </div>
  );
};