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
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">404</h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mb-4 sm:mb-6">{error || 'Link not found'}</p>
          <Link 
            href="/"
            className="text-sm sm:text-base text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/${code}`;

  return (
    <main className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 pb-8 sm:pb-12">
      <Link 
        href="/"
        className="text-sm sm:text-base text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mb-4 sm:mb-6 inline-block"
      >
        ← Back to Dashboard
      </Link>

      <div className="glass-panel rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
          Link Statistics
        </h1>

        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">Short URL</label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-1.5">
              <code className="flex-1 px-3 py-2 text-xs sm:text-sm glass-subtle rounded border text-blue-600 dark:text-blue-400 break-all">
                {shortUrl}
              </code>
              <button
                onClick={handleCopy}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition touch-manipulation whitespace-nowrap"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">Original URL</label>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-1.5 px-3 py-2 text-xs sm:text-sm glass-subtle rounded border text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 break-all"
            >
              {link.url}
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <div className="glass-panel rounded-lg sm:rounded-xl p-4 sm:p-6">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1 sm:mb-2">
            {link.clicks}
          </div>
          <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">Total Clicks</div>
        </div>

        <div className="glass-panel rounded-lg sm:rounded-xl p-4 sm:p-6">
          <div className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2 break-words">
            {formatDate(link.created_at)}
          </div>
          <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">Created</div>
        </div>

        <div className="glass-panel rounded-lg sm:rounded-xl p-4 sm:p-6">
          <div className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2 break-words">
            {formatDate(link.last_clicked)}
          </div>
          <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">Last Clicked</div>
        </div>
      </div>
    </main>
  );
}
