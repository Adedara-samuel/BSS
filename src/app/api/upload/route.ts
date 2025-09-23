/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return NextResponse.json({ error: 'Cloudinary cloud name is not configured' }, { status: 500 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader
        .upload_stream(
          {
            folder: folder || 'contestant',
            upload_preset: 'contestant_image',
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(result);
          }
        )
        .end(buffer);
    });

    return NextResponse.json({ secure_url: (result as any).secure_url });
  } catch (error: any) {
    console.error('Server-side upload error:', error);
    return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
  }
}