import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    
    // Revalidate specific path or everything
    if (body.path) {
      revalidatePath(body.path, 'page');
    } else {
      revalidatePath('/', 'layout');
    }
    
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err: any) {
    return NextResponse.json({ revalidated: false, message: err.message }, { status: 500 });
  }
}
