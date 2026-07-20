const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { decodeImage } = require('../utils/decodeImage');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('R2 client is reused and bounded by connection, socket, and retry limits', () => {
  const source = read('utils/imageupload.js');
  assert.match(source, /let client;/);
  assert.match(source, /connectionTimeout:\s*CONNECTION_TIMEOUT_MS/);
  assert.match(source, /socketTimeout:\s*SOCKET_TIMEOUT_MS/);
  assert.match(source, /maxAttempts:\s*2/);
});

test('all browser image upload flows use the shared resilient uploader', () => {
  const frontend = path.resolve(root, '..', 'Frontend', 'src');
  for (const file of [
    'Dashboard/common/Profile.tsx',
    'Dashboard/ngo/Donations/MyDonations.tsx',
    'Dashboard/Donar/Donations/DonationForm.tsx',
  ]) {
    assert.match(fs.readFileSync(path.join(frontend, file), 'utf8'), /uploadImage|uploadImages/);
  }
  const helper = fs.readFileSync(path.join(frontend, 'utils/imageUpload.ts'), 'utf8');
  assert.match(helper, /timeout:\s*UPLOAD_TIMEOUT_MS/);
  assert.match(helper, /onUploadProgress/);
  assert.match(helper, /RETRY_DELAY_MS/);
  assert.match(helper, /profiles:\s*\{ maxSizeMB: 0\.35, maxWidthOrHeight: 512 \}/);
  assert.match(helper, /MAX_FEEDBACK_IMAGES = 5/);
  const feedback = fs.readFileSync(path.join(frontend, 'Dashboard/ngo/Donations/MyDonations.tsx'), 'utf8');
  assert.match(feedback, /uploadImages\(files, 'feedback', 2\)/);
  // The donation/feedback profile is the one the double-compression bug used to silently defeat.
  assert.match(helper, /donations:\s*\{ maxSizeMB: 0\.75, maxWidthOrHeight: 1600 \}/);
  assert.match(helper, /feedback:\s*\{ maxSizeMB: 0\.75, maxWidthOrHeight: 1600 \}/);
});

test('donation form delegates all image compression to the shared uploader', () => {
  const donationForm = fs.readFileSync(
    path.resolve(root, '..', 'Frontend', 'src', 'Dashboard/Donar/Donations/DonationForm.tsx'),
    'utf8',
  );
  // Narrow guard: a reintroduced local compressor would run before the shared uploader (double compression).
  assert.doesNotMatch(donationForm, /imageCompression/);
  assert.doesNotMatch(donationForm, /compressImage/);
});

const MAGIC = {
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47],
  webp: [0x52, 0x49, 0x46, 0x46],
  gif: [0x47, 0x49, 0x46],
};

function dataUrl(declaredType, magicBytes, { pad = 32, wrap = false } = {}) {
  const buffer = Buffer.concat([Buffer.from(magicBytes), Buffer.alloc(pad, 0)]);
  let base64 = buffer.toString('base64');
  if (wrap) base64 = base64.replace(/(.{6})/g, '$1\n  '); // inject newlines + spaces a client might add
  return `data:${declaredType};base64,${base64}`;
}

test('decodeImage accepts image/jpg, normalizes to image/jpeg, and tolerates whitespace', () => {
  const result = decodeImage(dataUrl('image/jpg', MAGIC.jpeg, { wrap: true }));
  assert.equal(result.contentType, 'image/jpeg');
  assert.ok(Buffer.isBuffer(result.buffer) && result.buffer.length > 0);
});

test('decodeImage accepts jpeg, png, and webp when magic bytes match the declared type', () => {
  assert.equal(decodeImage(dataUrl('image/jpeg', MAGIC.jpeg)).contentType, 'image/jpeg');
  assert.equal(decodeImage(dataUrl('image/png', MAGIC.png)).contentType, 'image/png');
  assert.equal(decodeImage(dataUrl('image/webp', MAGIC.webp)).contentType, 'image/webp');
});

test('decodeImage rejects a spoofed type whose bytes do not match the declaration', () => {
  // Declares PNG but carries JPEG magic bytes -> anti-spoofing must reject.
  assert.throws(() => decodeImage(dataUrl('image/png', MAGIC.jpeg)), /does not match/);
});

test('decodeImage rejects unsupported types, non-strings, and oversized payloads', () => {
  assert.throws(() => decodeImage(dataUrl('image/gif', MAGIC.gif)), /Only JPEG, PNG, or WebP/);
  assert.throws(() => decodeImage(null), /Image is required/);
  const oversized = `data:image/jpeg;base64,${Buffer.concat([Buffer.from(MAGIC.jpeg), Buffer.alloc(5 * 1024 * 1024, 0)]).toString('base64')}`;
  assert.throws(() => decodeImage(oversized), /between 1 byte and 5 MB/);
});
