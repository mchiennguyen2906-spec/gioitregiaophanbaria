import { NextResponse } from 'next/server';
import { supabase } from '../../utils/supabaseClient';
import { verifyAdmin } from '../../utils/supabaseServer';

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const oldFileUrl: string | null = data.get('oldFileUrl') as string;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    // Size limit 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'File too large, max 5MB allowed' }, { status: 400 });
    }

    // Type validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowedTypes.includes(file.type) || file.name.toLowerCase().endsWith('.svg')) {
      return NextResponse.json({ success: false, message: 'Invalid file type. SVG is not allowed for security reasons.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to Supabase Storage
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const { data: uploadData, error } = await supabase.storage
      .from('public-files')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from('public-files')
      .getPublicUrl(filename);

    // Delete old file if provided
    if (oldFileUrl && oldFileUrl.includes('/public-files/')) {
      try {
        const oldFilename = oldFileUrl.split('/public-files/').pop();
        if (oldFilename) {
          await supabase.storage.from('public-files').remove([oldFilename]);
        }
      } catch (e) {
        console.error('Failed to delete old file:', e);
      }
    }

    return NextResponse.json({ success: true, url: publicUrlData.publicUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}
