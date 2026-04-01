import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { shortLinks } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const db = getDb();

  try {
    // 1. Buscar o link no banco
    const [link] = await db
      .select()
      .from(shortLinks)
      .where(eq(shortLinks.code, code))
      .limit(1);

    // 2. Validar se o link existe
    if (!link) {
      return new NextResponse('Link not found', { status: 404 });
    }

    // 3. Validar se o link expirou
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return new NextResponse('Link has expired', { status: 410 });
    }

    // 4. Incrementar o contador de cliques de forma assíncrona (não bloqueante)
    // Usamos sql para garantir a atomicidade do incremento
    db.update(shortLinks)
      .set({ clicks: sql`${shortLinks.clicks} + 1` })
      .where(eq(shortLinks.id, link.id))
      .execute()
      .catch((err) => console.error('Error incrementing clicks:', err));

    // 5. Redirecionar para a URL original
    return redirect(link.originalUrl);
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error; // Deixar o Next.js lidar com o redirecionamento
    }
    
    console.error('Error in link redirect:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
