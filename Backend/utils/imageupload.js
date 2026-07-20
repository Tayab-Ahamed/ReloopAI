const crypto = require('crypto');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { NodeHttpHandler } = require('@smithy/node-http-handler');

const CONNECTION_TIMEOUT_MS = 5_000;
const SOCKET_TIMEOUT_MS = 15_000;
const extensionFor = (contentType) => ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[contentType]);
const configured = () => ['S3_ENDPOINT', 'S3_ACCESS_KEY', 'S3_SECRET_KEY', 'S3_BUCKET', 'S3_PUBLIC_BASE'].every((key) => Boolean(process.env[key]));
let client;

function getClient() {
  if (!configured()) throw new Error('Image storage is not configured');
  if (!client) {
    client = new S3Client({
      region: 'auto',
      endpoint: process.env.S3_ENDPOINT,
      credentials: { accessKeyId: process.env.S3_ACCESS_KEY, secretAccessKey: process.env.S3_SECRET_KEY },
      requestHandler: new NodeHttpHandler({ connectionTimeout: CONNECTION_TIMEOUT_MS, socketTimeout: SOCKET_TIMEOUT_MS }),
      maxAttempts: 2,
    });
  }
  return client;
}

async function uploadImageToR2(image, folder) {
  if (!image?.buffer || !extensionFor(image.contentType)) throw new Error('Image payload is invalid');
  const key = `${folder}/${crypto.randomUUID()}.${extensionFor(image.contentType)}`;
  await getClient().send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: image.buffer,
    ContentType: image.contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }));
  return `${process.env.S3_PUBLIC_BASE.replace(/\/$/, '')}/${key}`;
}

module.exports = { uploadImageToR2, CONNECTION_TIMEOUT_MS, SOCKET_TIMEOUT_MS };
