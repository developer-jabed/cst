/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { uploadResultPDF } from '@/service/resultParser/result.service';
import { useState } from 'react';


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
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Upload Result PDF</h1>

      <form
        onSubmit={handleSubmit}
        className="border p-6 rounded-2xl shadow space-y-4"
      >
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? 'Uploading...' : 'Upload & Parse'}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 border rounded">
          <h2 className="font-semibold mb-2">Result:</h2>

          <p>Parsed: {result?.data?.parsedCount}</p>
          <p>Saved: {result?.data?.savedCount}</p>

          <pre className="bg-gray-100 p-2 mt-2 overflow-auto text-sm">
            {JSON.stringify(result?.data?.sample, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}