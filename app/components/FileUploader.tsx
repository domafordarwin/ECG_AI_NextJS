'use client';

import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function FileUploader({ onFileSelect, isLoading = false }: FileUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError(null);

      // Check for rejected files
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === 'file-too-large') {
          setError('파일이 너무 커요! 최대 50MB까지 가능해요. 😅');
        } else if (rejection.errors[0]?.code === 'file-invalid-type') {
          setError('WAV 파일만 올릴 수 있어요! 🎵');
        } else {
          setError('파일 업로드에 실패했어요. 다시 시도해주세요!');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        // Double-check file size
        if (file.size > MAX_FILE_SIZE) {
          setError('파일이 너무 커요! 최대 50MB까지 가능해요. 😅');
          return;
        }

        // Double-check file extension
        if (!file.name.toLowerCase().endsWith('.wav')) {
          setError('WAV 파일만 올릴 수 있어요! 🎵');
          return;
        }

        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/wav': ['.wav'],
      'audio/x-wav': ['.wav'],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled: isLoading,
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          border-4 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-all duration-200
          ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        {isLoading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
            <p className="text-lg text-blue-600 font-medium">분석 중... ⏳</p>
            <p className="text-sm text-gray-500">잠시만 기다려주세요!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>

            <div>
              <p className="text-xl font-medium text-gray-700">
                {isDragActive
                  ? '파일을 여기에 놓으세요!'
                  : 'WAV 파일을 드래그하거나 클릭하세요'}
              </p>
              <p className="text-sm text-gray-500 mt-2">최대 50MB까지 가능해요</p>
            </div>

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-sm text-gray-600">
        <p>💡 SpikerBox에서 녹음한 심전도 WAV 파일을 업로드해주세요</p>
        <p className="mt-1">권장 포맷: 10kHz, Mono, 16-bit PCM</p>
      </div>
    </div>
  );
}
