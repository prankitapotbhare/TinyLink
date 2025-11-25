'use client';

import { useState, FormEvent } from 'react';
import type { CreateLinkResponse } from '@/types';

interface LinkFormProps {
  onLinkCreated: (link: CreateLinkResponse) => void;
}

export default function LinkForm({ onLinkCreated }: LinkFormProps) {
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, customCode: customCode || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create link');
      }

      setSuccess('Link created successfully!');
      setUrl('');
      setCustomCode('');
      onLinkCreated(data);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-xl p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Create Short Link</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Original URL *
          </label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/very/long/url"
            required
            className="w-full px-4 py-2 glass-subtle rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        <div>
          <label htmlFor="customCode" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Custom Code (optional)
          </label>
          <input
            id="customCode"
            type="text"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            placeholder="mycode (6-8 characters)"
            pattern="[A-Za-z0-9]{6,8}"
            className="w-full px-4 py-2 glass-subtle rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Leave empty for random code
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm">
            ✓ {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating...
            </>
          ) : (
            'Create Short Link'
          )}
        </button>
      </form>
    </div>
  );
}
