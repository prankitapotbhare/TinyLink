'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import type { Link as LinkType } from '@/types';

export default function StatsPage() {
  const params = useParams();
  const code = params.code as string;
  
  const [link, setLink] = useState<LinkType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchLink = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/links/${code}`);
        
        if (!res.ok) {
          throw new Error('Link not found');
        }
        
        const data = await res.json();
        setLink(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchLink();
  }, [code]);

  const handleCopy = () => {
    const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/${code}`;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">{error || 'Link not found'}</p>
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/${code}`;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link 
        href="/"
        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mb-6 inline-block"
      >
        ← Back to Dashboard
      </Link>

      <div className="glass-panel rounded-xl p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">
          Link Statistics
        </h1>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Short URL</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 px-3 py-2 glass-subtle rounded border text-blue-600 dark:text-blue-400">
                {shortUrl}
              </code>
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Original URL</label>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-1 px-3 py-2 glass-subtle rounded border text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 break-all"
            >
              {link.url}
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-xl p-6">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {link.clicks}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Total Clicks</div>
        </div>

        <div className="glass-panel rounded-xl p-6">
          <div className="text-lg font-semibold mb-2">
            {formatDate(link.created_at)}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Created</div>
        </div>

        <div className="glass-panel rounded-xl p-6">
          <div className="text-lg font-semibold mb-2">
            {formatDate(link.last_clicked)}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Last Clicked</div>
        </div>
      </div>
    </main>
  );
}
