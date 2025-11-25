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
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--border)] border-t-[var(--accent)]"></div>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-semibold mb-3">404</h1>
          <p className="text-sm text-muted mb-6">{error || 'Link not found'}</p>
          <Link 
            href="/"
            className="text-sm link-accent"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/${code}`;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      <Link 
        href="/"
        className="text-sm link-accent mb-8 inline-block"
      >
        ← Back to Dashboard
      </Link>

      <div className="card rounded-lg p-6 sm:p-8 mb-6">
        <h1 className="text-2xl font-semibold mb-6">
          Link Statistics
        </h1>

        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium mb-2 block">Short URL</label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <code className="flex-1 px-3 py-2 text-sm input-field rounded-md font-mono break-all">
                {shortUrl}
              </code>
              <button
                onClick={handleCopy}
                className="px-4 py-2 text-sm font-medium btn-secondary rounded-md touch-manipulation whitespace-nowrap"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Original URL</label>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 text-sm input-field rounded-md link-accent break-all"
            >
              {link.url}
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card rounded-lg p-6">
          <div className="text-3xl font-semibold mb-2">
            {link.clicks}
          </div>
          <div className="text-sm text-muted">Total Clicks</div>
        </div>

        <div className="card rounded-lg p-6">
          <div className="text-base font-medium mb-2 break-words">
            {formatDate(link.created_at)}
          </div>
          <div className="text-sm text-muted">Created</div>
        </div>

        <div className="card rounded-lg p-6">
          <div className="text-base font-medium mb-2 break-words">
            {formatDate(link.last_clicked)}
          </div>
          <div className="text-sm text-muted">Last Clicked</div>
        </div>
      </div>
    </main>
  );
}
