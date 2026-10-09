import { createAdminClient } from "@/libs/supabase/admin";
import type { Post, PostFormInput, PostStatus } from "@/types/post";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assertValidUUID(id: string): void {
  if (!id || !UUID_REGEX.test(id))
    throw new Error("유효하지 않은 포스트 ID입니다.");
}

function toPost(row: any): Post {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content ?? null,
    excerpt: row.summary ?? null,
    cover_image_url: row.thumbnail_url ?? null,
    status: row.is_published ? "published" : "draft",
    published_at: row.published_at ?? null,
    author_id: row.author_id ?? null,
    tags: row.tags ?? [],
    sort_order: row.sort_order ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function toPostPayload(input: PostFormInput, status: PostStatus) {
  return {
    title: input.title,
    slug: input.slug,
    content: input.content || null,
    summary: input.excerpt || null,
    thumbnail_url: input.cover_image_url || null,
    is_published: status === "published",
  };
}

export async function getAllPosts(): Promise<Post[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("statkit_posts")
    .select("*")
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[getAllPosts]", error);
    throw new Error("포스트 목록을 불러오지 못했습니다.");
  }
  return (data ?? []).map(toPost);
}

export async function updatePostsSortOrder(
  updates: { id: string; sort_order: number }[],
): Promise<void> {
  const supabase = createAdminClient();
  const results = await Promise.all(
    updates.map(({ id, sort_order }) =>
      supabase.from("statkit_posts").update({ sort_order }).eq("id", id),
    ),
  );
  const failed = results.find(({ error }) => error);
  if (failed?.error) {
    console.error("[updatePostsSortOrder]", failed.error);
    throw new Error("순서 저장에 실패했습니다.");
  }
}

export async function getPostByIdAdmin(id: string): Promise<Post | null> {
  assertValidUUID(id);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("statkit_posts")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("[getPostByIdAdmin]", error);
    throw new Error("포스트를 불러오지 못했습니다.");
  }
  return toPost(data);
}

export async function createPost(
  input: PostFormInput,
  status: PostStatus,
): Promise<Post> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("statkit_posts")
    .insert(toPostPayload(input, status))
    .select()
    .single();
  if (error) {
    console.error("[createPost]", error);
    throw new Error("포스트 저장에 실패했습니다.");
  }
  return toPost(data);
}

export async function updatePost(
  id: string,
  input: PostFormInput,
  status: PostStatus,
): Promise<Post> {
  assertValidUUID(id);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("statkit_posts")
    .update(toPostPayload(input, status))
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("[updatePost]", error);
    throw new Error("포스트 수정에 실패했습니다.");
  }
  return toPost(data);
}

export async function deletePost(id: string): Promise<void> {
  assertValidUUID(id);
  const supabase = createAdminClient();
  const { error } = await supabase.from("statkit_posts").delete().eq("id", id);
  if (error) {
    console.error("[deletePost]", error);
    throw new Error("포스트 삭제에 실패했습니다.");
  }
}

export async function duplicatePost(id: string): Promise<Post> {
  assertValidUUID(id);
  const supabase = createAdminClient();

  const { data: allItems, error: listError } = await supabase
    .from("statkit_posts")
    .select("*")
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (listError) {
    console.error("[duplicatePost] list", listError);
    throw new Error("포스트 목록을 불러오지 못했습니다.");
  }

  const originalIdx = (allItems ?? []).findIndex((item) => item.id === id);
  if (originalIdx === -1) throw new Error("포스트를 찾을 수 없습니다.");
  const original = allItems![originalIdx];

  const reordered = [...allItems!];
  reordered.splice(originalIdx + 1, 0, { id: "__new__" } as typeof original);
  const newSortOrder = originalIdx + 2;

  const reorderUpdates = reordered
    .filter((item) => item.id !== "__new__")
    .map((item, i) => ({ id: item.id, sort_order: i + 1 }));

  const reorderResults = await Promise.all(
    reorderUpdates.map(({ id, sort_order }) =>
      supabase.from("statkit_posts").update({ sort_order }).eq("id", id),
    ),
  );
  const reorderFailed = reorderResults.find(({ error }) => error);
  if (reorderFailed?.error) {
    console.error("[duplicatePost] reorder", reorderFailed.error);
    throw new Error("순서 재배치에 실패했습니다.");
  }

  const { data, error } = await supabase
    .from("statkit_posts")
    .insert({
      title: `${original.title} (복사본)`,
      slug: `${original.slug}-copy-${Date.now()}`,
      content: original.content,
      summary: original.summary,
      thumbnail_url: original.thumbnail_url,
      tags: original.tags,
      author_id: original.author_id,
      is_published: false,
      sort_order: newSortOrder,
    })
    .select()
    .single();

  if (error) {
    console.error("[duplicatePost] insert", error);
    throw new Error("포스트 복사에 실패했습니다.");
  }
  return toPost(data);
}
