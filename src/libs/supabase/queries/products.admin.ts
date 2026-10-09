import { createAdminClient } from '@/libs/supabase/admin';
import type { Product, ProductFormInput, ProductStatus } from '@/types/product';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assertValidUUID(id: string): void {
  if (!id || !UUID_REGEX.test(id)) throw new Error('유효하지 않은 상품 ID입니다.');
}

function toPayload(input: ProductFormInput, status: ProductStatus) {
  const isFree = input.price_type === 'free';
  return {
    slug: input.slug,
    name: input.name,
    description: input.description || null,
    category: input.category || null,
    thumbnail_url: input.thumbnail_url || null,
    demo_url: input.demo_url || null,
    includes: input.includes || null,
    file_path: input.file_path || null,
    price_type: input.price_type,
    base_price: isFree ? 0 : input.base_price,
    options: isFree ? [] : input.options,
    status,
    is_active: status === 'active',
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('statkit_products')
    .select('*')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[getAllProducts]', error);
    throw new Error('상품 목록을 불러오지 못했습니다.');
  }
  return data ?? [];
}

export async function getProductByIdAdmin(id: string): Promise<Product | null> {
  assertValidUUID(id);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('statkit_products')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('[getProductByIdAdmin]', error);
    throw new Error('상품을 불러오지 못했습니다.');
  }
  return data;
}

export async function createProduct(input: ProductFormInput, status: ProductStatus): Promise<Product> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('statkit_products')
    .insert(toPayload(input, status))
    .select()
    .single();
  if (error) {
    console.error('[createProduct]', error);
    throw new Error('상품 저장에 실패했습니다.');
  }
  return data;
}

export async function updateProduct(id: string, input: ProductFormInput, status: ProductStatus): Promise<Product> {
  assertValidUUID(id);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('statkit_products')
    .update(toPayload(input, status))
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error('[updateProduct]', error);
    throw new Error('상품 수정에 실패했습니다.');
  }
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  assertValidUUID(id);
  const supabase = createAdminClient();
  const { error } = await supabase.from('statkit_products').delete().eq('id', id);
  if (error) {
    console.error('[deleteProduct]', error);
    throw new Error('상품 삭제에 실패했습니다.');
  }
}

export async function duplicateProduct(id: string): Promise<Product> {
  assertValidUUID(id);
  const supabase = createAdminClient();

  const { data: allItems, error: listError } = await supabase
    .from('statkit_products')
    .select('*')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (listError) {
    console.error('[duplicateProduct] list', listError);
    throw new Error('상품 목록을 불러오지 못했습니다.');
  }

  const originalIdx = (allItems ?? []).findIndex((item) => item.id === id);
  if (originalIdx === -1) throw new Error('상품을 찾을 수 없습니다.');
  const original = allItems![originalIdx];

  const reordered = [...allItems!];
  reordered.splice(originalIdx + 1, 0, { id: '__new__' } as typeof original);
  const newSortOrder = originalIdx + 2;

  const reorderUpdates = reordered
    .filter((item) => item.id !== '__new__')
    .map((item, i) => ({ id: item.id, sort_order: i + 1 }));

  const reorderResults = await Promise.all(
    reorderUpdates.map(({ id, sort_order }) =>
      supabase.from('statkit_products').update({ sort_order }).eq('id', id),
    ),
  );
  const reorderFailed = reorderResults.find(({ error }) => error);
  if (reorderFailed?.error) {
    console.error('[duplicateProduct] reorder', reorderFailed.error);
    throw new Error('순서 재배치에 실패했습니다.');
  }

  const { data, error } = await supabase
    .from('statkit_products')
    .insert({
      slug: `${original.slug}-copy-${Date.now()}`,
      name: `${original.name} (복사본)`,
      description: original.description,
      category: original.category,
      thumbnail_url: original.thumbnail_url,
      demo_url: original.demo_url,
      includes: original.includes,
      file_path: original.file_path,
      price_type: original.price_type,
      base_price: original.base_price,
      options: original.options,
      status: 'inactive',
      is_active: false,
      sort_order: newSortOrder,
    })
    .select()
    .single();

  if (error) {
    console.error('[duplicateProduct] insert', error);
    throw new Error('상품 복사에 실패했습니다.');
  }
  return data;
}

export async function updateProductsSortOrder(
  updates: { id: string; sort_order: number }[],
): Promise<void> {
  const supabase = createAdminClient();
  const results = await Promise.all(
    updates.map(({ id, sort_order }) =>
      supabase.from('statkit_products').update({ sort_order }).eq('id', id),
    ),
  );
  const failed = results.find(({ error }) => error);
  if (failed?.error) {
    console.error('[updateProductsSortOrder]', failed.error);
    throw new Error('순서 저장에 실패했습니다.');
  }
}
