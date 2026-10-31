/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { uploadResultPDF } from '@/service/resultParser/result.service';
import { useState } from 'react';

/* ───────────────────────── Icons ───────────────────────── */

const UploadIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FileIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ───────────────────────── Main ───────────────────────── */

export default function ResultParserPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a PDF file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    const res = await uploadResultPDF(formData);
    setLoading(false);
    setResult(res);
  };

  return (
    <div className="theme-content min-h-screen p-6">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div className="st-fade">
          <p className="mb-1 bg-gradient-to-r from-primary to-gold bg-clip-text text-xs font-bold uppercase tracking-[0.3em] text-transparent">
            Dashboard / Results
          </p>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Upload Result PDF</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Parse and import student results from a PDF file
          </p>
        </div>

        {/* Upload Card */}
        <form
          onSubmit={handleSubmit}
          className="st-row theme-card relative overflow-hidden shadow-[var(--shadow-card)]"
        >
          {/* Top accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary to-emerald-500" />

          <div className="flex flex-col gap-6 p-6">
            {/* File input */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Select PDF File
              </label>

              <label className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-secondary/40 px-6 py-10 transition-all duration-200 hover:border-primary/50 hover:bg-secondary/70">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/30 transition-transform duration-300 group-hover:scale-110">
                  <UploadIcon size={22} />
                </span>

                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">
                    {file ? file.name : 'Click to choose a PDF'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Only PDF files are accepted'}
                  </p>
                </div>

                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !file}
              className="group/btn flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary/60 py-3 text-sm font-semibold text-primary transition-all duration-200 hover:border-transparent hover:bg-gradient-to-br hover:from-primary hover:to-emerald-600 hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-secondary/60 disabled:hover:text-primary disabled:hover:shadow-none"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Uploading & Parsing...
                </>
              ) : (
                <>
                  Upload & Parse
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="transition-transform duration-200 group-hover/btn:translate-x-1"
                  >
                    <polyline points="6 3 11 8 6 13" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Result Card */}
        {result && (
          <div className="st-fade theme-card relative overflow-hidden shadow-[var(--shadow-card)]">
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-400" />

            <div className="flex flex-col gap-5 p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/30">
                  <CheckIcon size={18} />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Parse Complete</h2>
                  <p className="text-xs text-muted-foreground">Results have been processed successfully</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/60 p-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-emerald-600 shadow-sm">
                    <FileIcon size={16} />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700/70">Parsed</p>
                    <p className="text-xl font-black leading-none tabular-nums text-foreground">
                      {result?.data?.parsedCount ?? 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-100/60 p-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-amber-600 shadow-sm">
                    <CheckIcon size={16} />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700/70">Saved</p>
                    <p className="text-xl font-black leading-none tabular-nums text-foreground">
                      {result?.data?.savedCount ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sample JSON */}
              {result?.data?.sample && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Sample Data
                  </p>
                  <pre className="max-h-72 overflow-auto rounded-xl border border-border bg-secondary/50 p-4 text-xs leading-relaxed text-foreground">
                    {JSON.stringify(result.data.sample, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}