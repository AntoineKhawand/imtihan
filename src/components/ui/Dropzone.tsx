"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { FileText, Image, Upload, X, CheckCircle } from "lucide-react";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  base64: string;
}

interface DropzoneProps {
  value?: UploadedFile | null;
  onChange: (file: UploadedFile | null) => void;
  className?: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]!); // strip data:...;base64, prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function Dropzone({ value, onChange, className }: DropzoneProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        setError("File is too large. Maximum size is 10 MB.");
        return;
      }

      try {
        const base64 = await fileToBase64(file);
        onChange({ name: file.name, size: file.size, type: file.type, base64 });
      } catch {
        setError("Failed to read file. Please try again.");
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    multiple: false,
  });

  if (value) {
    const isImage = value.type.startsWith("image/");
    return (
      <div className={cn("relative flex items-center gap-4 p-4 rounded-2xl border border-[var(--accent)] bg-[var(--accent-light)]", className)}>
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[var(--accent)] bg-opacity-10 flex items-center justify-center text-[var(--accent)]">
          {isImage ? <Image size={20} /> : <FileText size={20} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text)] truncate">{value.name}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{formatFileSize(value.size)}</p>
        </div>
        <CheckCircle size={18} className="text-[var(--accent)] flex-shrink-0" />
        <button
          onClick={() => onChange(null)}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[var(--bg-subtle)] hover:bg-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
          aria-label="Remove file"
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className={cn("", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200",
          isDragActive
            ? "border-[var(--accent)] bg-[var(--accent-light)] scale-[1.01]"
            : "border-[var(--border)] bg-[var(--bg-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--surface)]"
        )}
      >
        <input {...getInputProps()} />
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
          isDragActive ? "bg-[var(--accent)] text-white" : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)]"
        )}>
          <Upload size={20} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-[var(--text)]">
            {isDragActive ? "Drop it here" : "Upload your document"}
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            PDF, DOCX, JPG or PNG · max 10 MB
          </p>
        </div>
        <p className="text-xs text-[var(--text-tertiary)] text-center">
          Textbook chapter, past exam, lesson notes, or syllabus
        </p>
      </div>
      {error && (
        <p className="mt-2 text-xs text-[var(--danger)]">{error}</p>
      )}
    </div>
  );
}
