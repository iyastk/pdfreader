import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export interface UploadProgress {
  progress: number;
  downloadUrl?: string;
  error?: string;
}

/**
 * Uploads a file to Firebase Storage and reports progress via callback.
 * Returns the public download URL when done.
 */
export function uploadPDF(
  file: File,
  categoryId: string,
  onProgress: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const storageRef = ref(storage, `pdfs/${categoryId}/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: 'application/pdf',
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        onProgress(progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
}
