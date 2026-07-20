// Dependency-free image data-URL validator/decoder.
// Kept isolated (no express / AWS SDK imports) so it can be unit-tested
// behaviorally without booting the app or installing the full dependency graph.

const MAX_BYTES = 5 * 1024 * 1024;

const TYPES = [
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] },
];

function decodeImage(value) {
  if (typeof value !== 'string') throw new Error('Image is required');
  // Strip all whitespace and newlines (some clients wrap base64 payloads)
  const cleaned = value.replace(/\s/g, '');
  const match = cleaned.match(/^data:(image\/(?:jpe?g|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error('Only JPEG, PNG, or WebP image data is accepted');
  let declaredType = match[1];
  if (declaredType === 'image/jpg') declaredType = 'image/jpeg';
  const buffer = Buffer.from(match[2], 'base64');
  if (!buffer.length || buffer.length > MAX_BYTES) throw new Error('Image must be between 1 byte and 5 MB');
  const signature = TYPES.find((entry) => entry.bytes.every((byte, index) => buffer[index] === byte));
  if (!signature || signature.mime !== declaredType) throw new Error('Image content does not match its declared type');
  return { buffer, contentType: signature.mime };
}

module.exports = { decodeImage, MAX_BYTES, TYPES };
