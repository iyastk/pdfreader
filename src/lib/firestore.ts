import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Category, Document } from '@/types';

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  try {
    const q = query(collection(db, 'categories'), orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
  } catch (err) {
    console.error('getCategories error (falling back to unordered):', err);
    const snapshot = await getDocs(collection(db, 'categories'));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const docRef = doc(db, 'categories', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Category;
}

export async function createCategory(name: string): Promise<string> {
  const docRef = await addDoc(collection(db, 'categories'), {
    name,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteCategory(id: string): Promise<void> {
  // Also delete all documents in this category
  const docs = await getDocumentsByCategory(id);
  await Promise.all(docs.map((d) => deleteDocument(d.id)));
  await deleteDoc(doc(db, 'categories', id));
}

// ─── Documents ───────────────────────────────────────────────────────────────

export async function getDocuments(): Promise<Document[]> {
  try {
    const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Document));
  } catch (err) {
    // Fallback: fetch without ordering if index is missing
    console.error('getDocuments error (falling back to unordered):', err);
    const snapshot = await getDocs(collection(db, 'documents'));
    const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Document));
    return docs.sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() ?? 0;
      const tb = b.createdAt?.toMillis?.() ?? 0;
      return tb - ta;
    });
  }
}

export async function getDocumentsByCategory(categoryId: string): Promise<Document[]> {
  try {
    // This query requires a composite index: categoryId ASC + createdAt DESC
    const q = query(
      collection(db, 'documents'),
      where('categoryId', '==', categoryId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Document));
  } catch (err) {
    // Fallback: fetch by categoryId only, sort client-side
    console.error('getDocumentsByCategory error (falling back):', err);
    const q = query(
      collection(db, 'documents'),
      where('categoryId', '==', categoryId)
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Document));
    return docs.sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() ?? 0;
      const tb = b.createdAt?.toMillis?.() ?? 0;
      return tb - ta;
    });
  }
}

export async function getDocumentById(id: string): Promise<Document | null> {
  const docRef = doc(db, 'documents', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Document;
}

export async function createDocument(data: {
  title: string;
  categoryId: string;
  type: 'firebase_upload' | 'drive_link';
  fileUrl: string;
}): Promise<string> {
  const docRef = await addDoc(collection(db, 'documents'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateDocument(
  id: string,
  data: Partial<Pick<Document, 'title' | 'categoryId' | 'fileUrl'>>
): Promise<void> {
  await updateDoc(doc(db, 'documents', id), data);
}

export async function deleteDocument(id: string): Promise<void> {
  await deleteDoc(doc(db, 'documents', id));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convert a Google Drive share link to an embed/viewer URL */
export function convertDriveLink(url: string): string {
  // File share link: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
  }

  // Open link: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openMatch) {
    return `https://drive.google.com/file/d/${openMatch[1]}/preview`;
  }

  // Already an embed/preview link
  if (url.includes('/preview')) return url;

  return url;
}

/** Get document count per category */
export async function getCategoriesWithCounts(): Promise<
  Array<Category & { documentCount: number }>
> {
  const [categories, documents] = await Promise.all([getCategories(), getDocuments()]);

  const countMap: Record<string, number> = {};
  documents.forEach((d) => {
    countMap[d.categoryId] = (countMap[d.categoryId] || 0) + 1;
  });

  return categories.map((c) => ({
    ...c,
    documentCount: countMap[c.id] || 0,
  }));
}
