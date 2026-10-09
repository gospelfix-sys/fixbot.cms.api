import { createAdminClient } from "@/libs/supabase/admin";
import type { Portfolio, PortfolioFormInput } from "@/types/portfolio";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assertValidUUID(id: string): void {
  if (!id || !UUID_REGEX.test(id))
    throw new Error("유효하지 않은 포트폴리오 ID입니다.");
}

function toPortfolio(row: any): Portfolio {
  return {
    id: row.id,
    title: row.title,
    category: row.category ?? null,
    description: row.description ?? null,
    tags: row.tags ?? [],
    thumbnail_url: row.thumbnail_url ?? null,
    site_url: row.site_url ?? null,
    images: row.images ?? [],
    is_published: row.is_published ?? false,
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function toPortfolioPayload(input: PortfolioFormInput) {
  return {
    title: input.title,
    category: input.category || null,
    description: input.description || null,
    tags: input.tags,
    thumbnail_url: input.thumbnail_url || null,
    site_url: input.site_url || null,
    images: input.images,
    is_published: input.is_published,
  };
}

const TABLE = "statkit_portfolios";

export async function getAllPortfolios(): Promise<Portfolio[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[getAllPortfolios]", error);
    throw new Error("포트폴리오 목록을 불러오지 못했습니다.");
  }
  return (data ?? []).map(toPortfolio);
}

export async function updatePortfoliosSortOrder(
  updates: { id: string; sort_order: number }[],
): Promise<void> {
  const supabase = createAdminClient();
  const results = await Promise.all(
    updates.map(({ id, sort_order }) =>
      supabase.from(TABLE).update({ sort_order }).eq("id", id),
    ),
  );
  const failed = results.find(({ error }) => error);
  if (failed?.error) {
    console.error("[updatePortfoliosSortOrder]", failed.error);
    throw new Error("순서 저장에 실패했습니다.");
  }
}

export async function getPortfolioByIdAdmin(
  id: string,
): Promise<Portfolio | null> {
  assertValidUUID(id);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("[getPortfolioByIdAdmin]", error);
    throw new Error("포트폴리오를 불러오지 못했습니다.");
  }
  return toPortfolio(data);
}

export async function createPortfolio(
  input: PortfolioFormInput,
): Promise<Portfolio> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(TABLE)
    .insert(toPortfolioPayload(input))
    .select()
    .single();
  if (error) {
    console.error("[createPortfolio]", error);
    throw new Error("포트폴리오 저장에 실패했습니다.");
  }
  return toPortfolio(data);
}

export async function updatePortfolio(
  id: string,
  input: PortfolioFormInput,
): Promise<Portfolio> {
  assertValidUUID(id);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update(toPortfolioPayload(input))
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("[updatePortfolio]", error);
    throw new Error("포트폴리오 수정에 실패했습니다.");
  }
  return toPortfolio(data);
}

export async function deletePortfolio(id: string): Promise<void> {
  assertValidUUID(id);
  const supabase = createAdminClient();
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) {
    console.error("[deletePortfolio]", error);
    throw new Error("포트폴리오 삭제에 실패했습니다.");
  }
}

export async function duplicatePortfolio(id: string): Promise<Portfolio> {
  assertValidUUID(id);
  const supabase = createAdminClient();

  const { data: allItems, error: listError } = await supabase
    .from(TABLE)
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (listError) {
    console.error("[duplicatePortfolio] list", listError);
    throw new Error("포트폴리오 목록을 불러오지 못했습니다.");
  }

  const originalIdx = (allItems ?? []).findIndex((item) => item.id === id);
  if (originalIdx === -1) throw new Error("포트폴리오를 찾을 수 없습니다.");
  const original = allItems![originalIdx];

  const reordered = [...allItems!];
  reordered.splice(originalIdx + 1, 0, { id: "__new__" } as typeof original);
  const newSortOrder = originalIdx + 2;

  const reorderUpdates = reordered
    .filter((item) => item.id !== "__new__")
    .map((item, i) => ({ id: item.id, sort_order: i + 1 }));

  const reorderResults = await Promise.all(
    reorderUpdates.map(({ id, sort_order }) =>
      supabase.from(TABLE).update({ sort_order }).eq("id", id),
    ),
  );
  const reorderFailed = reorderResults.find(({ error }) => error);
  if (reorderFailed?.error) {
    console.error("[duplicatePortfolio] reorder", reorderFailed.error);
    throw new Error("순서 재배치에 실패했습니다.");
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      title: original.title,
      category: original.category,
      description: original.description,
      tags: original.tags,
      thumbnail_url: original.thumbnail_url,
      site_url: original.site_url,
      images: original.images,
      is_published: false,
      sort_order: newSortOrder,
    })
    .select()
    .single();

  if (error) {
    console.error("[duplicatePortfolio] insert", error);
    throw new Error("포트폴리오 복사에 실패했습니다.");
  }
  return toPortfolio(data);
}
