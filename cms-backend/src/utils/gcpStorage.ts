import { Storage } from '@google-cloud/storage';
import path from 'path';

const storage = new Storage({
  keyFilename: process.env.GCP_KEY_PATH,
  projectId: process.env.GCP_PROJECT_ID,
});

const bucket = storage.bucket(process.env.GCP_BUCKET_NAME!);

export async function uploadProfilePicture(
  file: Express.Multer.File,
  employeeId: number
) {
  const ext = path.extname(file.originalname) || '.jpg';
  const fileName = `employees/employee_${employeeId}${ext}`;
  const blob = bucket.file(fileName);

  // 🚫 NO usar public: true — rompe con UBLA
  await blob.save(file.buffer, {
    resumable: false,
    metadata: {
      contentType: file.mimetype,
    },
  });

  // ✔️ Generar signed URL
  const [signedUrl] = await blob.getSignedUrl({
    action: 'read',
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 días
  });

  return signedUrl;
}
export async function getProfilePictureSignedUrl(employeeId: number) {
  const file = bucket.file(`employees/employee_${employeeId}.jpg`);

  const [signedUrl] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 días
  });

  return signedUrl;
}

