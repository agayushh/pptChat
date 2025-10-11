import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

// Configuration constants
const MAX_DURATION = 30; // 30 seconds timeout
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    
    if (!files.length) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    const processedImages = [];

    for (const file of files) {
      // Validate file type
      if (!SUPPORTED_FORMATS.includes(file.type)) {
        return NextResponse.json(
          { error: `Unsupported image format: ${file.type}` },
          { status: 400 }
        );
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `Image too large: ${file.name} (${Math.round(file.size / 1024 / 1024)}MB)` },
          { status: 400 }
        );
      }

      try {
        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Get image metadata
        const metadata = await sharp(buffer).metadata();
        
        // Process the image (resize if too large, optimize)
        let processedBuffer: Buffer = buffer;
        
        // Resize if image is very large (over 2048px in any dimension)
        if (metadata.width && metadata.height && 
            (metadata.width > 2048 || metadata.height > 2048)) {
          const resizedBuffer = await sharp(buffer)
            .resize(2048, 2048, { 
              fit: 'inside', 
              withoutEnlargement: false 
            })
            .jpeg({ quality: 85 }) // Convert to JPEG for smaller size
            .toBuffer();
          processedBuffer = resizedBuffer;
        }

        // Convert to base64 for sending to AI models
        const base64 = processedBuffer.toString('base64');
        const mimeType = metadata.format === 'jpeg' || metadata.format === 'jpg' 
          ? 'image/jpeg' 
          : file.type;

        processedImages.push({
          name: file.name,
          size: processedBuffer.length,
          originalSize: file.size,
          mimeType,
          base64,
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
        });

      } catch (imageError) {
        console.error('Error processing image:', imageError);
        return NextResponse.json(
          { error: `Failed to process image: ${file.name}` },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      images: processedImages,
      totalImages: processedImages.length,
      totalSize: processedImages.reduce((sum, img) => sum + img.size, 0),
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process images' },
      { status: 500 }
    );
  }
}

// Helper function to validate and process a single image
async function processImage(file: File) {
  if (!SUPPORTED_FORMATS.includes(file.type)) {
    throw new Error(`Unsupported image format: ${file.type}`);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Image too large: ${Math.round(file.size / 1024 / 1024)}MB`);
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const metadata = await sharp(buffer).metadata();
  
  // Optimize and resize if needed
  let processedBuffer: Buffer = buffer;
  
  if (metadata.width && metadata.height && 
      (metadata.width > 2048 || metadata.height > 2048)) {
    const resizedBuffer = await sharp(buffer)
      .resize(2048, 2048, { 
        fit: 'inside', 
        withoutEnlargement: false 
      })
      .jpeg({ quality: 85 })
      .toBuffer();
    processedBuffer = resizedBuffer;
  }

  return {
    name: file.name,
    size: processedBuffer.length,
    originalSize: file.size,
    mimeType: file.type,
    base64: processedBuffer.toString('base64'),
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
  };
}
