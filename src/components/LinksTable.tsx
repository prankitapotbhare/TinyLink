'use client';

import { useState } from 'react';
import { formatDate, truncateUrl } from '@/lib/utils';
import type { Link } from '@/types';

interface LinksTableProps {
  links: Link[];
  onLinkDeleted: (code: string) => void;
  onRefresh: () => void;
}

export default function LinksTable({ links, onLinkDeleted, onRefresh }: LinksTableProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    navigator.clipboard.writeText(`${baseUrl}/${code}`);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async (code: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    setDeleting(code);
    try {
      const res = await fetch(`/api/links/${code}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete link');
      }

      onLinkDeleted(code);
    } catch (err) {
      alert('Failed to delete link');
    } finally {
      setDeleting(null);
    }
  };

  if (links.length === 0) {
    return (
      <div className="card rounded-lg p-12 sm:p-16 text-center">
        <svg className="mx-auto mb-4 text-muted" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 13L14 11M10 11L14 13M19 7C19 8.65685 17.6569 10 16 10C15.5 10 15 9.85 14.6 9.6L9.4 12.4C9.45 12.6 9.5 12.8 9.5 13C9.5 13.2 9.45 13.4 9.4 13.6L14.6 16.4C15 16.15 15.5 16 16 16C17.6569 16 19 17.3431 19 19C19 20.6569 17.6569 22 16 22C14.3431 22 13 20.6569 13 19C13 18.8 13.05 18.6 13.1 18.4L7.9 15.6C7.5 15.85 7 16 6.5 16C4.84315 16 3.5 14.6569 3.5 13C3.5 11.3431 4.84315 10 6.5 10C7 10 7.5 10.15 7.9 10.4L13.1 7.6C13.05 7.4 13 7.2 13 7C13 5.34315 14.3431 4 16 4C17.6569 4 19 5.34315 19 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h3 className="text-lg font-semibold mb-2">No links yet</h3>
        <p className="text-sm text-muted">
          Create your first short link above
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {links.map((link) => (
          <div key={link.code} className="card rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <a
                href={`/code/${link.code}`}
                className="link-accent font-mono text-base"
              >
                {link.code}
              </a>
              <span className="text-sm font-medium ml-2">
                {link.clicks} clicks
              </span>
            </div>
            
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-muted hover:text-[var(--foreground)] transition mb-3 break-all"
              title={link.url}
            >
              {truncateUrl(link.url, 50)}
            </a>
            
            <div className="text-xs text-subtle mb-3">
              {formatDate(link.created_at)}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(link.code)}
                className="flex-1 px-3 py-2 text-xs font-medium btn-secondary rounded-md touch-manipulation"
              >
                {copied === link.code ? '✓ Copied' : 'Copy'}
              </button>
              <button
                onClick={() => handleDelete(link.code)}
                disabled={deleting === link.code}
                className="flex-1 px-3 py-2 text-xs font-medium btn-danger rounded-md disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                {deleting === link.code ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block card rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b divider">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">
                  Original URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">
                  Clicks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divider">
              {links.map((link) => (
                <tr key={link.code} className="hover:bg-[var(--card-hover)] transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      href={`/code/${link.code}`}
                      className="link-accent font-mono text-sm"
                    >
                      {link.code}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted hover:text-[var(--foreground)] transition"
                      title={link.url}
                    >
                      {truncateUrl(link.url, 60)}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium">
                      {link.clicks}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                    {formatDate(link.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(link.code)}
                        className="px-3 py-1.5 text-xs font-medium btn-secondary rounded-md"
                      >
                        {copied === link.code ? '✓' : 'Copy'}
                      </button>
                      <button
                        onClick={() => handleDelete(link.code)}
                        disabled={deleting === link.code}
                        className="px-3 py-1.5 text-xs font-medium btn-danger rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleting === link.code ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
