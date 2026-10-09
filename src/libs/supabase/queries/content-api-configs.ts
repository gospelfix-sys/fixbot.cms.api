import { createAdminClient } from '@/libs/supabase/admin';

export interface ContentApiConfig {
  id: string;
  resource_slug: string;
  label: string;
  table_name: string;
  is_enabled: boolean;
  filter_column: string | null;
  filter_value: string | null;
  filter_is_bool: boolean;
  identifier_column: string;
  identifier_type: 'uuid' | 'text';
  order_column: string;
  order_direction: 'asc' | 'desc';
  select_columns: string | null;
  created_at: string;
  updated_at: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class InvalidIdentifierError extends Error {
  constructor() {
    super('Invalid identifier format');
    this.name = 'InvalidIdentifierError';
  }
}

export async function getApiConfigBySlug(slug: string): Promise<ContentApiConfig | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('statkit_content_api_configs')
    .select('*')
    .eq('resource_slug', slug)
    .single();
  if (error || !data) return null;
  return data as ContentApiConfig;
}

export async function getAllApiConfigs(): Promise<ContentApiConfig[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('statkit_content_api_configs')
    .select('*')
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data as ContentApiConfig[];
}

export async function toggleApiConfig(id: string, isEnabled: boolean): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('statkit_content_api_configs')
    .update({ is_enabled: isEnabled })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function queryConfigList(
  config: ContentApiConfig,
  page: number,
  limit: number,
): Promise<{ data: unknown[]; total: number }> {
  const supabase = createAdminClient();
  const selectCols = config.select_columns ?? '*';

  let query = supabase.from(config.table_name).select(selectCols, { count: 'exact' });

  if (config.filter_column && config.filter_value !== null) {
    const filterVal: string | boolean = config.filter_is_bool
      ? config.filter_value === 'true'
      : config.filter_value;
    query = query.eq(config.filter_column, filterVal);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query
    .order(config.order_column, { ascending: config.order_direction === 'asc' })
    .range(from, to);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  return { data: data ?? [], total: count ?? 0 };
}

export async function queryConfigDetail(
  config: ContentApiConfig,
  identifier: string,
): Promise<unknown | null> {
  if (config.identifier_type === 'uuid') {
    if (!UUID_REGEX.test(identifier)) throw new InvalidIdentifierError();
  }

  const supabase = createAdminClient();
  const selectCols = config.select_columns ?? '*';

  const { data, error } = await supabase
    .from(config.table_name)
    .select(selectCols)
    .eq(config.identifier_column, identifier)
    .single();

  if (error || !data) return null;
  return data;
}
