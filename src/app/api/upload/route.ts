import { NextResponse } from 'next/server';
import { verifyEditor } from '../../utils/supabaseServer';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const isEditor = await verifyEditor();
    if (!isEditor) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    
    // Use Service Role key to bypass RLS on storage since we already verified admin status
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const oldFileUrl: string | null = data.get('oldFileUrl') as string;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    // Size limit 20MB
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ 
        success: false, 
        error: 'File quá lớn, dung lượng tối đa cho phép là 20MB.', 
        message: 'File too large, max 20MB allowed' 
      }, { status: 400 });
    }

    // Determine extension and normalize MIME type
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
    let fileType = file.type;

    // MIME inference for camera uploads where browser doesn't send MIME type
    if (!fileType || fileType === 'application/octet-stream') {
      const mimeMap: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        gif: 'image/gif',
        heic: 'image/heic',
        heif: 'image/heif',
        avif: 'image/avif',
        bmp: 'image/bmp',
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      };
      if (mimeMap[ext]) {
        fileType = mimeMap[ext];
      }
    }

    // Type validation
    const allowedTypes = [
      'image/jpeg', 
      'image/png', 
      'image/webp', 
      'image/gif', 
      'image/heic', 
      'image/heif', 
      'image/avif', 
      'image/bmp',
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'application/vnd.ms-excel', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(fileType) || file.name.toLowerCase().endsWith('.svg')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Định dạng file không hợp lệ hoặc không được hỗ trợ. Không cho phép file SVG vì lý do bảo mật.', 
        message: 'Invalid file type. SVG is not allowed for security reasons.' 
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to Supabase Storage
    // Sanitize filename for Supabase Storage (remove unicode, spaces, special chars)
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const normalizedName = baseName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const safeName = normalizedName.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'image';
    const filename = `${Date.now()}-${safeName}.${ext}`;
    const { data: uploadData, error } = await supabaseAdmin.storage
      .from('public-files')
      .upload(filename, buffer, {
        contentType: fileType,
        upsert: true
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json({ success: false, error: 'Upload failed: ' + error.message, message: error.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('public-files')
      .getPublicUrl(filename);

    // Delete old file if provided
    if (oldFileUrl && oldFileUrl.includes('/public-files/')) {
      try {
        const oldFilename = oldFileUrl.split('/public-files/').pop();
        if (oldFilename) {
          await supabaseAdmin.storage.from('public-files').remove([oldFilename]);
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
