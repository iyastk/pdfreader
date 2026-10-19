'use client';

interface UploadProgressProps {
  progress: number;
  fileName?: string;
}

export default function UploadProgress({ progress, fileName }: UploadProgressProps) {
  return (
    <div className="w-full rounded-xl border border-indigo-100 bg-indigo-50 p-4">
      {fileName && (
        <p className="mb-2 truncate text-sm font-medium text-indigo-700">{fileName}</p>
      )}
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-indigo-200">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="min-w-[40px] text-right text-sm font-semibold text-indigo-600">
          {progress}%
        </span>
      </div>
    </div>
  );
}
