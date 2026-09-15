import { NextResponse } from 'next/server';
import { supabase } from '../../utils/supabaseClient';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const oldFileUrl: string | null = data.get('oldFileUrl') as string;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
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
