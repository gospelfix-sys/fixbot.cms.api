import { createClient } from '@/libs/supabase/client';

export async function updateProfile(id: string, full_name: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ full_name, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}
