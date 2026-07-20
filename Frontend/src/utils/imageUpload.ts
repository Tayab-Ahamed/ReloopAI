import axios, { AxiosError } from 'axios';
import imageCompression from 'browser-image-compression';

export type UploadFolder = 'donations' | 'profiles' | 'feedback';

const MAX_SOURCE_BYTES = 5 * 1024 * 1024;
const UPLOAD_TIMEOUT_MS = 30_000;
const RETRY_DELAY_MS = 750;
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
export const MAX_FEEDBACK_IMAGES = 5;

const COMPRESSION_PROFILES: Record<UploadFolder, { maxSizeMB: number; maxWidthOrHeight: number }> = {
  profiles: { maxSizeMB: 0.35, maxWidthOrHeight: 512 },
  donations: { maxSizeMB: 0.75, maxWidthOrHeight: 1600 },
  feedback: { maxSizeMB: 0.75, maxWidthOrHeight: 1600 },
};

export class ImageUploadError extends Error {
  constructor(message: string, public readonly retryable = false) {
    super(message);
    this.name = 'ImageUploadError';
  }
}

function userMessage(error: unknown): ImageUploadError {
  if (error instanceof ImageUploadError) return error;
  if (axios.isAxiosError(error)) {
    const responseMessage = typeof error.response?.data?.message === 'string' ? error.response.data.message : '';
    if (error.code === AxiosError.ETIMEDOUT || error.code === 'ECONNABORTED' || !error.response || error.response.status >= 500) {
      return new ImageUploadError('Upload is taking longer than expected or is temporarily unavailable. Please try again.', true);
    }
    return new ImageUploadError(responseMessage || 'Image upload was rejected. Please choose a valid image.');
  }
  return new ImageUploadError('Image upload failed. Please try again.', true);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new ImageUploadError('Could not read the selected image.'));
    reader.onerror = () => reject(new ImageUploadError('Could not read the selected image.'));
    reader.readAsDataURL(file);
  });
}

async function prepareImage(file: File, folder: UploadFolder): Promise<File> {
  if (!ACCEPTED_TYPES.has(file.type)) throw new ImageUploadError('Only JPEG, PNG, or WebP images are supported.');
  if (file.size > MAX_SOURCE_BYTES) throw new ImageUploadError('Please select an image smaller than 5 MB.');
  try {
    return await imageCompression(file, { ...COMPRESSION_PROFILES[folder], useWebWorker: true, fileType: file.type });
  } catch {
    throw new ImageUploadError('Could not prepare the selected image. Please try another image.');
  }
}

export async function uploadImage(file: File, folder: UploadFolder, onProgress?: (percent: number) => void): Promise<string> {
  try {
    const image = await prepareImage(file, folder);
    const base64Image = await readAsDataUrl(image);
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await axios.post(`${import.meta.env.VITE_Backend_URL}/api/upload`, { base64Image, folder }, {
          withCredentials: true,
          timeout: UPLOAD_TIMEOUT_MS,
          onUploadProgress: (event) => { if (event.total) onProgress?.(Math.round((event.loaded / event.total) * 100)); },
        });
        if (!response.data?.success || typeof response.data.url !== 'string') throw new ImageUploadError('Image storage did not return an upload URL.', true);
        return response.data.url;
      } catch (error) {
        const normalized = userMessage(error);
        if (!normalized.retryable || attempt === 1) throw normalized;
        await new Promise((resolve) => window.setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
    throw new ImageUploadError('Image upload failed. Please try again.', true);
  } catch (error) {
    throw userMessage(error);
  }
}

export async function uploadImages(files: File[], folder: UploadFolder, concurrency = 2): Promise<string[]> {
  if (folder === 'feedback' && files.length > MAX_FEEDBACK_IMAGES) {
    throw new ImageUploadError(`You can upload up to ${MAX_FEEDBACK_IMAGES} feedback images at a time.`);
  }
  const results = new Array<string>(files.length);
  let nextIndex = 0;
  const worker = async () => {
    while (nextIndex < files.length) {
      const index = nextIndex++;
      results[index] = await uploadImage(files[index], folder);
    }
  };
  await Promise.all(Array.from({ length: Math.min(Math.max(concurrency, 1), files.length) }, worker));
  return results;
}

export function getUploadErrorMessage(error: unknown): string {
  return userMessage(error).message;
}
