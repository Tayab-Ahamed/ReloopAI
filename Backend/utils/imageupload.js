const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY,
  },
});

const uploadImageToR2 = async (base64Image, folder) => {
  try {
    if (!base64Image || !folder) {
      throw new Error('Missing required parameters: base64Image or folder');
    }

    // Check if R2 credentials are set. If not, return a mock image URL fallback.
    if (!process.env.CLOUDFLARE_R2_ACCESS_KEY || !process.env.CLOUDFLARE_R2_SECRET_KEY || !process.env.CLOUDFLARE_R2_BUCKET_NAME) {
      console.warn('[imageupload] Cloudflare R2 credentials not configured. Returning mock image URL.');
      
      const mockImages = {
        donations: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80&w=800',
        food: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
        electronics: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&q=80&w=800',
        furniture: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800',
        books: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
        clothes: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=800',
        medical: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800',
        recyclables: 'https://images.unsplash.com/photo-1532996122724-e3463d24a215?auto=format&fit=crop&q=80&w=800',
      };
      return mockImages[folder as keyof typeof mockImages] || mockImages.donations;
    }

    const buffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.jpeg`;

    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: 'image/jpeg',
    });

    await s3Client.send(command);
    
    // Construct the public URL using the public endpoint
    return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileName}`;
  } catch (error) {
    console.error('Error uploading image to R2:', error);
    throw new Error('Failed to upload image');
  }
};

module.exports = { uploadImageToR2 };