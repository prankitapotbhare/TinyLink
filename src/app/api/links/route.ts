import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateRandomCode, validateCode, validateUrl } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, customCode } = body;

    if (!url || !validateUrl(url)) {
      return NextResponse.json(
        { error: 'Please enter a valid URL' },
        { status: 400 }
      );
    }

    let code = customCode;
    
    if (code) {
      if (!validateCode(code)) {
        return NextResponse.json(
          { error: 'Code must be 6-8 alphanumeric characters' },
          { status: 400 }
        );
      }
    } else {
      code = generateRandomCode(6);
      
      let attempts = 0;
      while (attempts < 5) {
        const existing = await pool.query(
          'SELECT code FROM links WHERE code = $1',
          [code]
        );
        if (existing.rows.length === 0) break;
        code = generateRandomCode(6);
        attempts++;
      }
    }

    const result = await pool.query(
      'INSERT INTO links (code, url) VALUES ($1, $2) RETURNING *',
      [code, url]
    );

    const link = result.rows[0];
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    return NextResponse.json(
      {
        code: link.code,
        url: link.url,
        shortUrl: `${baseUrl}/${link.code}`,
        clicks: link.clicks,
        createdAt: link.created_at
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Code already exists' },
        { status: 409 }
      );
    }
    
    console.error('Error creating link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await pool.query(
      'SELECT * FROM links ORDER BY created_at DESC'
    );

    return NextResponse.json({ 
      links: result.rows 
    });
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
