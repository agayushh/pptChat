export interface ProcessedFile {
  name: string;
  size: number;
  type: string;
  content: string;
  contentLength: number;
  originalSize: number;
  lastModified?: number;
  [key: string]: string | number | undefined;
}
