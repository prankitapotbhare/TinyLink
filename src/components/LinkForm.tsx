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
    <div className="card rounded-lg p-6 sm:p-8 mb-8">
      <h2 className="text-lg font-semibold mb-6">Create Short Link</h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="url" className="block text-sm font-medium mb-2">
            Original URL
          </label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/very/long/url"
            required
            className="w-full px-4 py-2.5 text-sm input-field rounded-md"
          />
        </div>

        <div>
          <label htmlFor="customCode" className="block text-sm font-medium mb-2">
            Custom Code <span className="text-subtle font-normal">(optional)</span>
          </label>
          <input
            id="customCode"
            type="text"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            placeholder="mycode"
            pattern="[A-Za-z0-9]{6,8}"
            className="w-full px-4 py-2.5 text-sm input-field rounded-md"
          />
          <p className="text-xs text-subtle mt-2">
            6-8 characters, leave empty for random code
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm animate-fadeIn">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 text-green-600 dark:text-green-400 text-sm animate-fadeIn">
            ✓ {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-2.5 text-sm font-medium btn-primary rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 touch-manipulation"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--background)] border-t-transparent"></div>
              Creating...
            </>
          ) : (
            'Create Link'
          )}
        </button>
      </form>
    </div>
  );
}
