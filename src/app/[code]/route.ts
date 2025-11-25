import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const result = await client.query(
        'SELECT * FROM links WHERE code = $1',
        [code]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'Not found' },
          { status: 404 }
        );
      }

      const link = result.rows[0];

      await client.query(
        'UPDATE links SET clicks = clicks + 1, last_clicked = NOW() WHERE code = $1',
        [code]
      );

      await client.query('COMMIT');

      return NextResponse.redirect(link.url, { status: 302 });
      
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error redirecting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
