import React, { useRef, useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  X,
  RefreshCw,
  Calendar,
  AlertCircle,
  FileCheck,
  Maximize2
} from 'lucide-react';
import { UploadedImageState } from '../../types/analysis';
import { formatBytes } from '../../utils/formatters';

interface ImageDropzoneProps {
  label: string;
  sublabel: string;
  imageState: UploadedImageState | null;
  onImageSelected: (state: UploadedImageState) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  label,
  sublabel,
  imageState,
  onImageSelected,
  onRemove,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

  const validateAndProcessFile = (file: File) => {
    setValidationError(null);

    // Validate size (10 MB)
    if (file.size > MAX_SIZE_BYTES) {
      setValidationError(`Image exceeds 10 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`);
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setValidationError('Unsupported format. Please upload JPEG, PNG, or WebP.');
      return;
    }

    // Load preview and determine dimensions
    const previewUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      onImageSelected({
        file,
        previewUrl,
        filename: file.name,
        sizeBytes: file.size,
        dimensions: { width: img.naturalWidth, height: img.naturalHeight },
        captureDate: imageState?.captureDate,
        isSample: false,
      });
    };
    img.onerror = () => {
      setValidationError('Failed to decode image file. Ensure file is not corrupt.');
      URL.revokeObjectURL(previewUrl);
    };
    img.src = previewUrl;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!imageState) return;
    onImageSelected({
      ...imageState,
      captureDate: e.target.value,
    });
  };

  return (
    <div className="flex flex-col rounded-2xl bg-space-900 border border-slate-800/80 p-5 shadow-lg relative overflow-hidden transition-all duration-200 hover:border-slate-700/80">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-100 text-sm tracking-wide uppercase font-mono">
              {label}
            </span>
            {imageState?.isSample && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-space-800 border border-mint-500/30 text-mint-accent">
                Sample
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>
        </div>

        {imageState && (
          <button
            onClick={onRemove}
            disabled={disabled}
            className="p-1 rounded-lg text-slate-400 hover:text-coral-400 hover:bg-space-800 transition-colors disabled:opacity-40"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Validation Error banner */}
      {validationError && (
        <div className="mt-3 p-2.5 rounded-lg bg-coral-500/10 border border-coral-500/30 flex items-start space-x-2 text-xs text-coral-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="flex-1">{validationError}</span>
          <button onClick={() => setValidationError(null)} className="text-coral-400 hover:text-slate-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Upload Zone / Preview Area */}
      <div className="mt-4 flex-1">
        {imageState ? (
          <div className="flex flex-col space-y-3">
            {/* Image Preview Container */}
            <div className="relative aspect-video rounded-xl bg-space-950 border border-slate-800 overflow-hidden group">
              <img
                src={imageState.previewUrl}
                alt={imageState.filename}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-space-950/80 via-transparent to-transparent pointer-events-none" />

              {/* Resolution pill */}
              {imageState.dimensions && (
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-space-900/90 border border-slate-700/80 text-[10px] font-mono text-slate-300 backdrop-blur">
                  {imageState.dimensions.width} × {imageState.dimensions.height} px
                </div>
              )}

              {/* Replace Button overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="absolute top-2 right-2 px-2.5 py-1 rounded bg-space-900/90 hover:bg-space-800 border border-slate-700 text-[11px] font-medium text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur flex items-center space-x-1 shadow"
              >
                <RefreshCw className="w-3 h-3 text-mint-accent" />
                <span>Replace</span>
              </button>
            </div>

            {/* Metadata Chips */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded-lg bg-space-850 border border-slate-800 truncate">
                <span className="text-[10px] text-slate-500 uppercase block">File Name</span>
                <span className="text-slate-300 text-[11px] truncate block" title={imageState.filename}>
                  {imageState.filename}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-space-850 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Size</span>
                <span className="text-slate-300 text-[11px] block">
                  {formatBytes(imageState.sizeBytes)}
                </span>
              </div>
            </div>

            {/* Optional Capture Date */}
            <div className="pt-1">
              <label className="block text-[11px] text-slate-400 font-mono mb-1 flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-mint-accent" />
                  <span>Capture Date</span>
                </span>
                <span className="text-[10px] text-slate-500">(user-entered)</span>
              </label>
              <input
                type="date"
                value={imageState.captureDate || ''}
                onChange={handleDateChange}
                disabled={disabled}
                className="w-full bg-space-850 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-mint-500/60 transition-colors"
              />
            </div>
          </div>
        ) : (
          /* Empty Drag & Drop State */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 aspect-video ${
              isDragOver
                ? 'border-mint-500 bg-mint-500/5'
                : 'border-slate-800 hover:border-slate-700 bg-space-950/40 hover:bg-space-950/80'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-space-800 border border-slate-700 flex items-center justify-center text-mint-accent mb-3 group-hover:scale-110 transition-transform shadow-inner">
              <Upload className="w-6 h-6" />
            </div>

            <p className="text-xs font-medium text-slate-200 mb-1">
              Drag & drop satellite image, or <span className="text-mint-accent underline">browse</span>
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              JPEG, PNG, WebP • Max 10 MB
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};
