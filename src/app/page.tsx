'use client';

import { useState, useEffect } from 'react';
import LinkForm from '@/components/LinkForm';
import LinksTable from '@/components/LinksTable';
import type { Link, CreateLinkResponse } from '@/types';

export default function Dashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/links');
      
      if (!res.ok) {
        throw new Error('Failed to fetch links');
      }
      
      const data = await res.json();
      setLinks(data.links || []);
    } catch (err) {
      setError('Failed to load links. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleLinkCreated = (newLink: CreateLinkResponse) => {
    fetchLinks();
  };

  const handleLinkDeleted = (code: string) => {
    setLinks(links.filter(link => link.code !== code));
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          URL Shortener Dashboard
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Create short links and track their performance
        </p>
      </div>

      <LinkForm onLinkCreated={handleLinkCreated} />

      {error && (
        <div className="mt-6 p-4 glass-panel rounded-lg border-red-500/50">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="mt-8 flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading links...</p>
        </div>
      ) : (
        <LinksTable 
          links={links} 
          onLinkDeleted={handleLinkDeleted}
          onRefresh={fetchLinks}
        />
      )}
    </main>
  );
}
