import { supabase } from './supabase';
import { goto } from '$app/navigation';

export async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    goto('/');
    throw new Error('redirected');
  }
}

export async function requireAdmin() {
  const { data: { session } } = await supabase.auth.getSession();
  const role = session?.user?.app_metadata?.role;
  if (role !== 'admin') {
    goto('/tasks');
    throw new Error('redirected');
  }
}
