import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import csv from 'csv-parser';
import { Readable } from 'stream';

// Configuration
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'text/plain',
  'text/csv',
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/json',
  'text/markdown',
  'text/rtf',
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files.length) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const processedFiles = [];

    for (const file of files) {
      // Validate file type
      if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Unsupported file format: ${file.type} for file ${file.name}` },
          { status: 400 }
        );
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large: ${file.name} (${Math.round(file.size / 1024 / 1024)}MB). Max size is 25MB.` },
          { status: 400 }
        );
      }

      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        let extractedText = '';
        let metadata: any = {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        };

        // Process based on file type
        switch (file.type) {
          case 'application/pdf':
            // PDF parsing is complex and requires additional setup
            // For now, we'll indicate PDF support but extract basic info
            extractedText = `PDF file: ${file.name}\nSize: ${(file.size / 1024 / 1024).toFixed(2)} MB\n\n[PDF content extraction will be implemented in a future update. Please convert to text format for now.]`;
            metadata = {
              ...metadata,
              note: 'PDF parsing requires additional configuration',
            };
            break;

          case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          case 'application/msword':
            const docxResult = await mammoth.extractRawText({ buffer });
            extractedText = docxResult.value;
            metadata = {
              ...metadata,
              hasImages: docxResult.messages.some(m => m.type === 'warning' && m.message.includes('image')),
            };
            break;

          case 'text/plain':
          case 'text/markdown':
          case 'text/rtf':
          case 'application/json':
            extractedText = buffer.toString('utf-8');
            break;

          case 'text/csv':
          case 'application/vnd.ms-excel':
          case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            // Parse CSV
            extractedText = await parseCSV(buffer);
            break;

          default:
            throw new Error(`Unsupported file type: ${file.type}`);
        }

        // Clean and validate extracted text
        extractedText = extractedText.trim();
        if (!extractedText) {
          throw new Error(`No readable content found in ${file.name}`);
        }

        // Limit text length to prevent overwhelming the context
        const MAX_CONTENT_LENGTH = 50000; // ~50k characters
        if (extractedText.length > MAX_CONTENT_LENGTH) {
          extractedText = extractedText.substring(0, MAX_CONTENT_LENGTH) + '\n\n[Content truncated due to length...]';
        }

        processedFiles.push({
          ...metadata,
          content: extractedText,
          contentLength: extractedText.length,
          originalSize: file.size,
        });

      } catch (fileError: any) {
        console.error(`Error processing file ${file.name}:`, fileError);
        return NextResponse.json(
          { error: `Failed to process file: ${file.name}. ${fileError.message || 'Unknown error'}` },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      files: processedFiles,
      totalFiles: processedFiles.length,
      totalSize: processedFiles.reduce((sum, file) => sum + file.originalSize, 0),
      totalContentLength: processedFiles.reduce((sum, file) => sum + file.contentLength, 0),
    });

  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process files' },
      { status: 500 }
    );
  }
}

// Helper function to parse CSV content
async function parseCSV(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    const readable = Readable.from(buffer);
    
    readable
      .pipe(csv())
      .on('data', (row: Record<string, any>) => results.push(row))
      .on('end', () => {
        // Convert CSV data to readable text format
        if (results.length === 0) {
          resolve('Empty CSV file');
          return;
        }

        const headers = Object.keys(results[0]);
        let text = `CSV File Content:\n\nHeaders: ${headers.join(', ')}\n\n`;
        
        // Add sample rows (limit to first 50 rows to prevent overwhelming)
        const sampleRows = results.slice(0, 50);
        sampleRows.forEach((row, index) => {
          text += `Row ${index + 1}:\n`;
          headers.forEach(header => {
            text += `  ${header}: ${row[header] || 'N/A'}\n`;
          });
          text += '\n';
        });

        if (results.length > 50) {
          text += `... and ${results.length - 50} more rows\n`;
        }

        text += `\nTotal rows: ${results.length}`;
        resolve(text);
      })
      .on('error', reject);
  });
}

// Helper function for Excel files (basic implementation)
async function parseExcel(buffer: Buffer): Promise<string> {
  // For now, treat as binary and extract what we can
  // In a production app, you'd want to use a proper Excel parser like xlsx
  try {
    const text = buffer.toString('utf-8');
    return `Excel file content (basic extraction):\n\n${text.replace(/[^\x20-\x7E\n]/g, '')}`;
  } catch (error) {
    throw new Error('Could not parse Excel file');
  }
}
