'use server';

import { revalidatePath } from 'next/cache';

/** Call after adding/deleting a document to instantly refresh all affected pages */
export async function revalidateDocumentPages(categoryId?: string) {
  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/documents');
  if (categoryId) {
    revalidatePath(`/category/${categoryId}`);
  }
}

/** Call after adding/deleting a category */
export async function revalidateCategoryPages() {
  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/categories');
}
