import { NextResponse } from 'next/server';
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import fs from 'fs';

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

    // Save to public/uploads
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure dir exists
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    
    // Delete old file if provided
    if (oldFileUrl && oldFileUrl.startsWith('/uploads/')) {
      try {
        const oldFilename = oldFileUrl.replace('/uploads/', '');
        const oldFilePath = path.join(uploadDir, oldFilename);
        if (fs.existsSync(oldFilePath)) {
          await unlink(oldFilePath);
        }
      } catch (e) {
        console.error('Failed to delete old file:', e);
      }
    }

    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}
