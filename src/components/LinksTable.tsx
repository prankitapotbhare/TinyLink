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
      <div className="glass-panel rounded-lg sm:rounded-xl p-8 sm:p-12 text-center">
        <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🔗</div>
        <h3 className="text-lg sm:text-xl font-semibold mb-2">No links yet</h3>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          Create your first short link above to get started
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3 sm:space-y-4">
        {links.map((link) => (
          <div key={link.code} className="glass-panel rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <a
                href={`/code/${link.code}`}
                className="text-blue-600 dark:text-blue-400 font-mono font-bold text-lg hover:underline"
              >
                {link.code}
              </a>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400 ml-2">
                {link.clicks} 👆
              </span>
            </div>
            
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition mb-3 break-all"
              title={link.url}
            >
              {truncateUrl(link.url, 50)}
            </a>
            
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
              Created: {formatDate(link.created_at)}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(link.code)}
                className="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition touch-manipulation"
              >
                {copied === link.code ? '✓ Copied' : 'Copy Link'}
              </button>
              <button
                onClick={() => handleDelete(link.code)}
                disabled={deleting === link.code}
                className="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-zinc-400 disabled:cursor-not-allowed transition touch-manipulation"
              >
                {deleting === link.code ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50/50 dark:bg-zinc-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Original URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Clicks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {links.map((link) => (
                <tr key={link.code} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      href={`/code/${link.code}`}
                      className="text-blue-600 dark:text-blue-400 font-mono font-medium hover:underline"
                    >
                      {link.code}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                      title={link.url}
                    >
                      {truncateUrl(link.url, 60)}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-zinc-900 dark:text-zinc-100 font-semibold">
                      {link.clicks}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                    {formatDate(link.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(link.code)}
                        className="px-3 py-1 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                      >
                        {copied === link.code ? '✓ Copied' : 'Copy'}
                      </button>
                      <button
                        onClick={() => handleDelete(link.code)}
                        disabled={deleting === link.code}
                        className="px-3 py-1 text-xs font-medium rounded bg-red-600 text-white hover:bg-red-700 disabled:bg-zinc-400 disabled:cursor-not-allowed transition"
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
