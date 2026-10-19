import { Timestamp } from 'firebase/firestore';

export interface Category {
  id: string;
  name: string;
  createdAt: Timestamp;
}

export interface Document {
  id: string;
  title: string;
  categoryId: string;
  type: 'firebase_upload' | 'drive_link';
  fileUrl: string;
  createdAt: Timestamp;
}

export interface CategoryWithCount extends Category {
  documentCount: number;
}
