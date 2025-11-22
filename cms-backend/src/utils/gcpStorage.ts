// @ts-nocheck
import path from 'path';

let bucket: any = null;

function ensureBucket() {
  if (bucket) return;
  try {
    // Lazy-load GCP client so that local/dev environments without the library
    // or credentials can still start the server (profile upload will just fail
    // at call time instead of crashing on import).
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Storage } = require('@google-cloud/storage');
    const storage = new Storage({
      keyFilename: process.env.GCP_KEY_PATH,
      projectId: process.env.GCP_PROJECT_ID,
    });
    bucket = storage.bucket(process.env.GCP_BUCKET_NAME!);
  } catch (e) {
    throw new Error(
      'GCP Storage not configured or @google-cloud/storage not installed. ' +
        'Profile picture upload is disabled in this environment.',
    );
  }
}

export async function uploadProfilePicture(file: any, employeeId: number) {
  ensureBucket();

  const ext = path.extname(file.originalname) || '.jpg';
  const fileName = `employees/employee_${employeeId}${ext}`;
  const blob = bucket.file(fileName);

  await blob.save(file.buffer, {
    resumable: false,
    metadata: {
      contentType: file.mimetype,
    },
  });

  // URL "casi permanente"
  const [signedUrl] = await blob.getSignedUrl({
    action: 'read',
    expires: '03-01-2500', // expiración muy lejana
  });

  return signedUrl;
}

export async function getProfilePictureSignedUrl(employeeId: number) {
  ensureBucket();

  const file = bucket.file(`employees/employee_${employeeId}.jpg`);

  // URL "casi permanente"
  const [signedUrl] = await file.getSignedUrl({
    action: 'read',
    expires: '03-01-2500', // expiración muy lejana
  });

  return signedUrl;
}


