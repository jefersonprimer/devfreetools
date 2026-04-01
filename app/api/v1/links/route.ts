import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getDb } from '@/lib/db';
import { shortLinks } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  const userId = await getSession();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getDb();
    const links = await db
      .select()
      .from(shortLinks)
      .where(eq(shortLinks.userId, userId))
      .orderBy(desc(shortLinks.createdAt));

    return NextResponse.json({ links });
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}
