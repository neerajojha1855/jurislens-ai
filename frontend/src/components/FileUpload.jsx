import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, FileCheck, ShieldCheck, Loader2 } from 'lucide-react';

export default function FileUpload({ onFileAnalyzed, isLoading }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const validateAndHandleFile = (file) => {
    setErrorMessage('');
    if (!file) return;

    const validExtensions = ['.pdf', '.docx'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(fileExt)) {
      setErrorMessage(`Invalid format (${fileExt}). Only PDF (.pdf) and Word (.docx) files are supported.`);
      setSelectedFile(null);
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 15 MB limit.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    onFileAnalyzed(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isLoading) return;
    const file = e.dataTransfer.files?.[0];
    validateAndHandleFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    validateAndHandleFile(file);
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-8 px-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative group cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-slate-700 hover:border-slate-600 bg-slate-900/60'
        } ${isLoading ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={handleFileSelect}
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
            <div>
              <h3 className="text-lg font-semibold text-white">Analyzing Legal Agreement...</h3>
              <p className="text-sm text-slate-400 mt-1">
                Gemini 2.5 Flash is parsing clauses, identifying parties, and assessing risk levels.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">
                Upload your Legal Document
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Drag & drop or <span className="text-indigo-400 underline font-medium">browse</span> your agreement
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700">
                <FileText className="w-3.5 h-3.5 text-red-400" />
                PDF (.pdf)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700">
                <FileCheck className="w-3.5 h-3.5 text-blue-400" />
                Word (.docx)
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Confidential & secure: Documents are processed in-memory.</span>
            </div>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
