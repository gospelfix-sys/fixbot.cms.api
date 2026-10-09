'use server';

import {
  createProduct,
  updateProduct,
  deleteProduct,
  duplicateProduct,
  updateProductsSortOrder,
} from '@/libs/supabase/queries/products.admin';
import type { Product, ProductFormInput, ProductStatus } from '@/types/product';

export async function createProductAction(input: ProductFormInput, status: ProductStatus): Promise<Product> {
  return createProduct(input, status);
}

export async function updateProductAction(id: string, input: ProductFormInput, status: ProductStatus): Promise<Product> {
  return updateProduct(id, input, status);
}

export async function deleteProductAction(id: string): Promise<void> {
  return deleteProduct(id);
}

export async function duplicateProductAction(id: string): Promise<Product> {
  return duplicateProduct(id);
}

export async function updateProductsSortOrderAction(
  updates: { id: string; sort_order: number }[],
): Promise<void> {
  return updateProductsSortOrder(updates);
}
